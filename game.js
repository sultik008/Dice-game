import { randomInt, randomBytes, createHmac } from "crypto";
import Readline from "readline/promises";
import Die from "./die.js";
import ASCii from 'ascii-table';

const args = process.argv.slice(2);

function check() {
  if (!args.length) {
    console.log("Write params");
    process.exit(1);
  } else if (args.length <= 1)
    console.log("write 2 or more params"), process.exit(1);
  for (let i = 0; i < args.length; i++) {
    args[i] = args[i].split(",");
    for (let y = 0; y < args[i].length; y++) {
      let num = Number.parseInt(args[i][y]);
      if (Number.isInteger(num)) {
        args[i][y] = num;
      } else {
        console.log("All faces must be integers");
        process.exit(1);
      }
    }
  }
  for (let i = 0; i < args.length; i++) {
    if (args[i].length !== 6) {
      console.log("All dice must have 6 faces");
      process.exit(1);
    }
  }
}
let guide = new ASCii("Play guide")
guide.setAlign(1 , ASCii.CENTER)
guide.addRow(1 ,  "Bot Generates a random number {0,1,2,3,4,5}")
.addRow(2 , "Generates a secret key")
.addRow(3 ,"For honestyt he will display HMAC after you select a number he will show key , number you can generate hmac and equal with him hmac")
.addRow(4, "you select a number {0,1,2,3,4,5}")
.addRow(5, "Calculates the resultShows both the result and also the key and number")
let help = new ASCii("Probability of the win fоr the user:");

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

      let win = 0;
      let lose = 0;

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

let dice = [];
for (let i = 0; i < args.length; i++) {
  dice[i] = new Die(args[i]);
}

function hmac(a, b) {
  const key = randomBytes(32).toString("hex");
  let rndm = randomInt(a, b);
  const hmac = createHmac("sha3-256", key).update(rndm.toString()).digest("hex");
  return { hmac, rndm, key };
}

const rl = Readline.createInterface(process.stdin, process.stdout);

while (true) {
  let evdnc = hmac(0, 2);
  console.log(`\nI thought number, HMAC FOR HONESTY ${evdnc.hmac}`);
  console.log("Try to predict my number in range of 0...1 \n0-0\n1-1\n?-help\nx-exit");

  let slct = await rl.question("Your selection: ");
  process.stdout.moveCursor(15, -1);
  process.stdout.clearLine(1);
  console.log(` ${slct}\n My number: ${evdnc.rndm} (key=${evdnc.key})`);

  if (slct === "x") {
    process.exit(1)
  }

  if (slct === "?") {
    console.log("Help");
    console.log(guide.toString())
    console.log(help.toString());
    continue;
  }

  let bi, bd, br, i, d, r;

  if (slct == evdnc.rndm) {
    console.log("You’ve won, you throw first");

    for (let i = 0; i < dice.length; i++) {
      console.log(`${i} - ${JSON.stringify(dice[i].faces)}`);
    }

    slct = await rl.question(`Your selection: `);
    i = Number(slct);
    d = dice[i];
    console.log(`Youve selected die ${JSON.stringify(d.faces)}`)
    r = d.roll();

    evdnc = hmac(0, dice.length);
    console.log(`HMAC FOR HONESTY ${evdnc.hmac}`);

    bi = evdnc.rndm;
    bd = dice[bi];
    br = bd.roll();

    console.log(`You rolled ${r} (your number ${i})`);
    console.log(`I rolled ${br} (my number ${bi}) (KEY=${evdnc.key})`);

    if (r > br) {
      console.log("You win!");
    } else if (r < br) {
      console.log("I win!");
    } else {
      console.log("It's a draw!");
    }

  } else {
    console.log("Youve lost, Iam throwing first");

    evdnc = hmac(0, dice.length);
    bi = evdnc.rndm;
    bd = dice[bi];
    console.log(`Ive selected die ${JSON.stringify(bd.faces)}`)
    br = bd.roll();

    

    for (let i = 0; i < dice.length; i++) {
      console.log(`${i} - ${JSON.stringify(dice[i].faces)}`);
    }

    slct = await rl.question(`Your selection: `);
    i = Number(slct);
    d = dice[i];
    console.log(`Youve selected die ${JSON.stringify(d)}`)
    r = d.roll();
    console.log(`Ive rolled ${br} (my number ${bi}) (KEY=${evdnc.key})`);
    console.log(`Youve rolled ${r} (Die ${i})`);

    if (r > br) {
      console.log("You win!");
    } else if (r < br) {
      console.log("I win!");
    } else {
      console.log("Its a draw!");
    }
  }
}
