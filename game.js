import { randomInt, randomBytes, createHmac } from "crypto";
import Readline from "readline/promises";
import Die from "./die.js";
import ASCii from "ascii-table";

const args = process.argv.slice(2);

function check() {
  if (!args.length) {
    console.log("Write params(must be more than 2)");
    process.exit(1);
  } else if (args.length <= 2) {
    console.log("write 3 or more params");
    process.exit(1);
  }

  for (let i = 0; i < args.length; i++) {
    let num;
    args[i] = args[i].split(",").map((x) => {
      num = Number.parseFloat(x);
      if (!Number.isInteger(num)) {
        console.log("All faces must be integers");
        process.exit(1);
      }
      num = Number.parseFloat(num);
      return num;
    });
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i].length !== 6) {
      console.log("All dice must have 6 faces");
      process.exit(1);
    }
  }
}
let guide = new ASCii("Play guide");
guide.setAlign(1, ASCii.CENTER);
guide
  .addRow(1, "Bot Generates a random number")
  .addRow(2, "Generates a secret key and prints HMAC")
  .addRow(3, "After your guess, it shows key and number")
  .addRow(4, "Winner selects first die")
  .addRow(5, "Roll is fair via random + input % 6");

let help = new ASCii("Probability of the win for the user:");
function chanceToWin() {
  let arr = ["User dice V", ...args];
  help.addRow(arr);
  for (let i = 0; i < args.length; i++) {
    const row = [args[i].join(",")];
    for (let j = 0; j < args.length; j++) {
      if (i === j) {
        row.push(".3333");
        continue;
      }
      let win = 0,
        lose = 0;
      for (let a of args[i]) {
        for (let b of args[j]) {
          if (a > b) win++;
          else if (a < b) lose++;
        }
      }
      const total = win + lose;
      const res = total === 0 ? 0.5 : win / total;
      row.push(res.toFixed(4).slice(1));
    }
    help.addRow(row);
  }
}

check();
chanceToWin();

let dice = args.map((faces) => new Die(faces));

function hmac(a, b) {
  let key = randomBytes(32).toString("hex");
  let rndm = randomInt(a, b);
  let hmac = createHmac("sha3-256", key).update(rndm.toString()).digest("hex");
  return { hmac, rndm, key };
}

const rl = Readline.createInterface(process.stdin, process.stdout);
let evdnc = hmac(0, 2);

console.log("Let's determine who makes the first move.");
console.log(
  `I selected a random value in the range 0..1 (HMAC=${evdnc.hmac}).`
);
console.log("Try to guess my selection.\n0 - 0\n1 - 1\nX - exit\n? - help");

let slct2 = await rl.question("Your selection: ");
if (slct2.toLowerCase() === "x") process.exit();
if (slct2 === "?") {
  console.log(guide.toString());
  console.log(help.toString());
  slct2 = await rl.question("Your selection: ");
}

console.log(`My selection: ${evdnc.rndm} (KEY=${evdnc.key}).`);

let bi, bd, i, d;

if (slct2 == evdnc.rndm) {
  console.log("You make the first move.");
  console.log("Choose your dice:");
  dice.forEach((die, index) => console.log(`${index} - ${die.getfaces()}`));
  console.log("X - exit\n? - help");

  let index;
  while (true) {
    let input = await rl.question("Your selection: ");
    if (input.toLowerCase() === "x") process.exit();
    if (input === "?") {
      console.log(guide.toString());
      console.log(help.toString());
      continue;
    }
    index = Number(input);
    if (dice[index]) break;
    else console.log("Invalid selection.");
  }

  i = index;
  d = dice[i];
  console.log(`You choose the ${d.getfaces()} dice.`);

  do {
    bi = randomInt(0, dice.length);
  } while (bi === i);
  bd = dice[bi];
  console.log(`I make the second move and choose the ${bd.getfaces()} dice.`);
} else {
  console.log("I make the first move.");
  bi = randomInt(0, dice.length);
  bd = dice[bi];
  console.log(`I choose the ${bd.getfaces()} dice.`);

  console.log("Choose your dice:");
  dice.forEach((die, index) => {
    if (index !== bi) console.log(`${index} - ${die.getfaces()}`);
  });
  console.log("X - exit\n? - help");

  let index;
  while (true) {
    let input = await rl.question("Your selection: ");
    if (input.toLowerCase() === "x") process.exit();
    if (input === "?") {
      console.log(guide.toString());
      console.log(help.toString());
      continue;
    }
    index = Number(input);
    if (dice[index] && index !== bi) break;
    else console.log("Invalid selection.");
  }

  i = index;
  d = dice[i];
  console.log(`You choose the ${d.getfaces()} dice.`);
}

console.log("It's time for my roll.");
evdnc = hmac(0, 6);
console.log(
  `I selected a random value in the range 0..5 (HMAC=${evdnc.hmac}).`
);
console.log("Add your number modulo 6.");
console.log("0 - 0\n1 - 1\n2 - 2\n3 - 3\n4 - 4\n5 - 5\nX - exit\n? - help");

let mI = await rl.question("Your selection: ");
let mN = Number(mI);
let bri = (mN + evdnc.rndm) % 6;
let br = bd.roll(bri);
if (mI.toLowerCase() === "x") process.exit();
if (mI === "?") {
  console.log(guide.toString());
  console.log(help.toString());
  mI = await rl.question("Your selection: ");
}

console.log(`My number is ${evdnc.rndm} (KEY=${evdnc.key}).`);

console.log(
  `The fair number generation result is ${mN} + ${evdnc.rndm} = ${bri} (mod 6).`
);
console.log(`My roll result is ${br}.`);

console.log("It's time for your roll.");
evdnc = hmac(0, 6);
console.log(
  `I selected a random value in the range 0..5 (HMAC=${evdnc.hmac}).`
);
console.log("Add your number modulo 6.");
console.log("0 - 0\n1 - 1\n2 - 2\n3 - 3\n4 - 4\n5 - 5\nX - exit\n? - help");

let uM = await rl.question("Your selection: ");
if (uM.toLowerCase() === "x") process.exit();
if (uM === "?") {
  console.log(guide.toString());
  console.log(help.toString());
  uM = await rl.question("Your selection: ");
}

let uN = Number(uM);
console.log(`My number is ${evdnc.rndm} (KEY=${evdnc.key}).`);
let uri = (uN + evdnc.rndm) % 6;
let ur = d.roll(uri);
console.log(
  `The fair number generation result is ${uN} + ${evdnc.rndm} = ${uri} (mod 6).`
);
console.log(`Your roll result is ${ur}.`);

if (ur > br) {
  console.log(`You win (${ur} > ${br})!`);
} else if (ur < br) {
  console.log(`I win (${br} > ${ur})!`);
} else {
  console.log("It's a draw!");
}

process.exit();
