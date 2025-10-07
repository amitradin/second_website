//I'm going to send myselft a notification when a task due date is in 2 days
import dotenv from "dotenv";
import twilio from "twilio";
import Task from "../models/Task.js";

dotenv.config({ quiet: true });
// now I can access process.env variables

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const accountToken = process.env.TWILIO_AUTH_TOKEN;

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const my_phone = process.env.MY_PHONE;

const client = twilio(accountSid, accountToken); // Create a Twilio client

const checkDueTasks = async () => {
  try {
    const tasks = await Task.find({ completed: false }); // Fetch all pending tasks
    const now = new Date();
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(now.getDate() + 2);
    twoDaysFromNow.setHours(23, 59, 59, 999); // End of the day two days from now

    const dueTasks = tasks.filter((task) => {
      return task.dueDate >= now && task.dueDate <= twoDaysFromNow;
    });
    const sortedDueTasks = dueTasks.sort(
      (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
    ); // Sort by due date ascending

    // Ill send a text in case there are tasks due in 2 days, to save money on twilio

    if (sortedDueTasks.length > 0) {
      await sendSMS(sortedDueTasks); // in one text Ill send all the tasks due in 2 days
      console.log("I've sent you a notification for tasks due in 2 days.");
    } else {
      console.log("No tasks due in 2 days.");
    }
  } catch (error) {
    console.error("Error checking due dates:", error);
  }
};

const sendSMS = async (tasks) => {
  // Create the actual message content
  try {
    let message = `You have ${tasks.length} tasks due in 2 days:\n\n`;

    tasks.forEach((task, index) => {
      message += `${index + 1}. ${task.title} \n`;
      message += `Course: ${task.course} \n`;
      message += `Priority: ${task.priority} \n`;
      message += `Due Date: ${task.dueDate.toLocaleDateString("en-IL")} \n\n`;
    });

    const messageResponse = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: my_phone,
    });
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
};

// lets schedule this to run every day at 9am

const scheduleDailyCheck = () => {
  const scheduleNextTask = () => {
    const now = new Date();
    const nextCheck = new Date();
    nextCheck.setDate(now.getDate() + 1);
    nextCheck.setHours(9, 0, 0, 0); // Set to 9:00 AM next day

    const timeUntilNext = nextCheck.getTime() - now.getTime();

    setTimeout(async () => {
      await checkDueTasks();
      scheduleNextTask(); // Schedule the next check
    }, timeUntilNext);
  };

  // Run immediately if its after 9am, otherwise wait till 9am
  const now = new Date();
  const nineAMToday = new Date();
  nineAMToday.setHours(9, 0, 0, 0);

  if (now >= nineAMToday) {
    checkDueTasks().then(() => {
      scheduleNextTask();
    });
  } else {
    const timeUntil9AM = nineAMToday.getTime() - now.getTime();
    setTimeout(() => {
      checkDueTasks().then(() => {
        scheduleNextTask();
      });
    }, timeUntil9AM);
  }
};

export { checkDueTasks, sendSMS, scheduleDailyCheck };

// Start the schedule
if (process.env.ENABLE_SMS === "true") scheduleDailyCheck(); // Only enable if the env variable is set to "true"
