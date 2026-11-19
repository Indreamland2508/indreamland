var $ = function (id) {
  return document.getElementById(id);
};

var query = new URLSearchParams(location.search);
var recipient = query.get("to");
var sender = query.get("from");

if (recipient) $("to").textContent = "Gửi " + recipient;
$("hi").textContent = recipient ? "Gửi " + recipient + " thân mến," : "Gửi người mình thương,";
$("sign").textContent = sender ? "Thương yêu, " + sender : "Thương yêu";
if (sender) $("av").textContent = sender.trim().charAt(0).toUpperCase();

var hero = document.querySelector(".hero");
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  for (var i = 0; i < 34; i++) {
    var dot = document.createElement("span");
    dot.className = "dot";
    dot.style.left = Math.random() * 100 + "%";
    dot.style.animationDuration = 6 + Math.random() * 8 + "s";
    dot.style.animationDelay = -Math.random() * 12 + "s";
    dot.style.transform = "scale(" + (0.6 + Math.random() * 1.2) + ")";
    hero.appendChild(dot);
  }
}

var wishes = [
  ["Ấm áp", "Chúc bạn một mùa đông ấm áp bên những người mình thương.", "#bd5150"],
  ["Bình yên", "Mong mọi lo toan nhẹ đi, chỉ còn lại những buổi tối yên ả.", "#527b5a"],
  ["Niềm vui", "Mong mỗi ngày đều có một điều nhỏ bé khiến bạn mỉm cười.", "#d6aa59"],
  ["Biết ơn", "Cảm ơn bạn vì đã luôn ở đó, kể cả những lúc mình không nói ra.", "#bd5150"],
  ["Sức khỏe", "Chúc bạn thật khỏe để làm những điều mình yêu thích.", "#527b5a"],
  ["Hy vọng", "Năm mới sắp đến, mong những điều bạn đợi chờ sẽ đến thật đúng lúc.", "#d6aa59"]
];
var opened = {};

function updateWishProgress() {
  var count = Object.keys(opened).length;
  $("prog").textContent = count === wishes.length
    ? "Bạn đã mở hết sáu lời chúc."
    : "Đã mở " + count + "/" + wishes.length + " lời chúc";
}

wishes.forEach(function (wish, index) {
  var button = document.createElement("button");
  button.type = "button";
  button.className = "card";
  button.setAttribute("aria-expanded", "false");
  button.innerHTML = '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="26" y="4" width="12" height="9" rx="2" fill="#b8860b"/><circle cx="32" cy="38" r="22" fill="' + wish[2] + '"/><path d="M18 30q14 -10 28 0" stroke="#fff" stroke-opacity=".6" stroke-width="3" fill="none"/></svg>';

  var title = document.createElement("b");
  title.textContent = wish[0];
  var hint = document.createElement("span");
  hint.className = "h";
  hint.textContent = "Chạm để mở";
  var message = document.createElement("span");
  message.className = "m";
  message.textContent = wish[1];
  button.append(title, hint, message);
  button.onclick = function () {
    var isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", isOpen ? "false" : "true");
    opened[index] = true;
    updateWishProgress();
  };
  $("wishes").appendChild(button);
});
updateWishProgress();

function updateCountdown() {
  var now = new Date();
  var year = now.getFullYear();
  var christmas = new Date(year, 11, 25);
  if (now > new Date(year, 11, 25, 23, 59, 59)) christmas = new Date(year + 1, 11, 25);

  var remaining = Math.max(0, christmas - now);
  var parts = [
    ["Ngày", Math.floor(remaining / 864e5)],
    ["Giờ", Math.floor(remaining / 36e5) % 24],
    ["Phút", Math.floor(remaining / 6e4) % 60],
    ["Giây", Math.floor(remaining / 1e3) % 60]
  ];
  var boxes = $("boxes");
  boxes.textContent = "";
  if (now.getMonth() === 11 && now.getDate() === 25) {
    boxes.textContent = "Hôm nay là Giáng Sinh. Chúc bạn một ngày thật ấm áp!";
    return;
  }

  parts.forEach(function (part) {
    var box = document.createElement("div");
    box.className = "bx";
    var value = document.createElement("b");
    value.textContent = String(part[1]).padStart(2, "0");
    var label = document.createElement("small");
    label.textContent = part[0];
    box.append(value, label);
    boxes.appendChild(box);
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

var notes = { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392 };
var melody = [
  ["E", 1], ["E", 1], ["E", 2], ["E", 1], ["E", 1], ["E", 2], ["E", 1], ["G", 1], ["C", 1.5], ["D", .5], ["E", 4],
  ["F", 1], ["F", 1], ["F", 1.5], ["F", .5], ["F", 1], ["E", 1], ["E", 1], ["E", .5], ["E", .5], ["E", 1], ["D", 1], ["D", 1], ["E", 1], ["D", 2], ["G", 2]
];
var audioContext = null;
var musicTimer = null;
var beat = .36;

function playNote(frequency, start, duration) {
  var oscillator = audioContext.createOscillator();
  var gain = audioContext.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(.22, start + .015);
  gain.gain.exponentialRampToValueAtTime(.001, start + duration + .5);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .55);
}

function playMelody() {
  var start = audioContext.currentTime + .05;
  melody.forEach(function (note) {
    var duration = note[1] * beat;
    playNote(notes[note[0]], start, duration);
    start += duration;
  });
  musicTimer = setTimeout(playMelody, (start - audioContext.currentTime + 1.2) * 1000);
}

function stopMusic() {
  clearTimeout(musicTimer);
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  $("play").textContent = "Phát nhạc ♫";
  $("play").setAttribute("aria-pressed", "false");
}

$("play").onclick = function () {
  if (audioContext) {
    stopMusic();
    return;
  }
  try {
    var AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
    playMelody();
    $("play").textContent = "Dừng nhạc ♫";
    $("play").setAttribute("aria-pressed", "true");
  } catch (error) {
    $("mnote").textContent = "Trình duyệt này chưa hỗ trợ phát nhạc.";
  }
};

var tasks = [
  "Cùng nhau nấu một bữa tối thật ấm",
  "Trang trí cây thông hoặc góc nhà",
  "Viết một tấm thiệp tay gửi người thương",
  "Nướng bánh quy hoặc làm món ngọt chung",
  "Xem lại một bộ phim quen thuộc của gia đình",
  "Gọi điện hoặc nhắn tin cho người ở xa",
  "Tặng một món quà tự làm",
  "Chụp một tấm ảnh chung để nhớ"
];
var storageKey = "giangsinh-hoatdong";
var taskState = {};

try {
  taskState = JSON.parse(localStorage.getItem(storageKey) || "{}") || {};
} catch (error) {
  taskState = {};
}

function updateTaskProgress() {
  var count = 0;
  tasks.forEach(function (_, index) {
    if (taskState[index]) count++;
  });
  $("tprog").textContent = count === tasks.length
    ? "Bạn đã làm hết tất cả. Giáng Sinh này chắc chắn thật trọn vẹn!"
    : "Đã làm " + count + "/" + tasks.length + " việc";
}

tasks.forEach(function (task, index) {
  var label = document.createElement("label");
  label.className = "task";
  var checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = !!taskState[index];
  var text = document.createElement("span");
  text.textContent = task;
  label.append(checkbox, text);
  checkbox.onchange = function () {
    taskState[index] = checkbox.checked;
    try {
      localStorage.setItem(storageKey, JSON.stringify(taskState));
    } catch (error) {
      $("tprog").textContent = "Không thể lưu tiến độ trên trình duyệt này.";
      return;
    }
    updateTaskProgress();
  };
  $("tasks").appendChild(label);
});
updateTaskProgress();

$("copy").onclick = function () {
  var url = new URL(location.href);
  url.search = "";
  url.hash = "";
  if ($("inTo").value.trim()) url.searchParams.set("to", $("inTo").value.trim());
  if ($("inFrom").value.trim()) url.searchParams.set("from", $("inFrom").value.trim());

  var shareLink = url.toString();
  function copied() {
    $("msg").textContent = "Đã sao chép link. Bạn có thể dán và gửi ngay.";
  }
  function showLink() {
    $("msg").textContent = "Hãy sao chép link này: " + shareLink;
  }

  try {
    navigator.clipboard.writeText(shareLink).then(copied, showLink);
  } catch (error) {
    showLink();
  }
};
