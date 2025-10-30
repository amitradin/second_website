import Task from '../models/Task.js';
import User from '../models/User.js';
import sendEmailNotification from './emailNotification.js';

//Function to send notifications for tasks due in 2 days

export const checkDueTasks = async () => {
    try{
        console.log("Searching for tasks that are due in 2 days ")

        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
        twoDaysFromNow.setHours(0, 0, 0, 0);

        const endOfDay = new Date(twoDaysFromNow);
        endOfDay.setHours(23, 59, 59, 999);

        // Find tasks due in 2 days
        let dueTasks = await Task.find({
            dueDate: { $gte: Date.now(), $lte: endOfDay },
            completed: false // Only consider incomplete tasks
            
        }).populate('user'); // This gets the user details too.

        dueTasks = dueTasks.filter(task => {
            return task.user && task.user.notification; // Corrected from 'notifications' to 'notification'
        }) // Filter tasks where user has allowed notifications.

        for (const task of dueTasks){
            try{
                const user = task.user;
                if(user && user.email){
                    const result = await sendEmailNotification(user.email, task);
                    if(result.success){
                        console.log(`Notification sent successfully to ${user.email} for task "${task.title}"`);
                    } else {
                        console.error(`Failed to send notification to ${user.email} for task "${task.title}": ${result.error}`);
                    }
                }
                else{
                    console.log(`No user found for task "${task.title}", skipping notification.`);
                }

                await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between emails

            } catch(error){
                console.error(`Error sending notification for task "${task.title}":`, error);
            }
        }

        return dueTasks.length;
    }
    catch(error){
        console.error("Error checking due tasks:", error);
        return 0;
    }
}

const scheduleNotifications = () => {
    const twentyFourHours = 24 * 60 * 60 * 1000;

    const runCheck = () => {
        console.log("Running scheduled task check...");
        checkDueTasks();
    };

    const scheduleNextCheck = () => {
        const now = new Date();
        const nextCheck = new Date();

        nextCheck.setHours(9, 0, 0, 0); // Set target time to 9:00:00 AM

        // If it's already past 9 AM today, schedule for 9 AM tomorrow
        if (now > nextCheck) {
            nextCheck.setDate(nextCheck.getDate() + 1);
        }

        const delay = nextCheck.getTime() - now.getTime();

        console.log(`Notification scheduler started. Next check in ${Math.round(delay / 1000 / 60)} minutes.`);

        setTimeout(() => {
            runCheck(); // Run the check once
            setInterval(runCheck, twentyFourHours); // Then run it every 24 hours
        }, delay);
    };

    scheduleNextCheck();
}

scheduleNotifications(); //Starting the scheduler