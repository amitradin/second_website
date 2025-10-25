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
        const dueTasks = await Task.find({
            dueDate: { $gte: Date.now(), $lte: endOfDay },
            completed: false // Only consider incomplete tasks
            //Should only send to users that allowed notifications but for testing I'll skip that
        }).populate('user'); // This gets the user details too.

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
    const checkInterval = 24 * 60 * 60 * 1000; // Check every 24 hours

    // Initial check
    checkDueTasks();

    setInterval(() => {
        const now = new Date();
        if(now.getHours() === 9){ // Fixed: added () to getHours()
            checkDueTasks();
        }

    } , checkInterval);

    console.log("Notification scheduler started, will check for due tasks every 24 hours at 9 AM.");
}

scheduleNotifications(); //Starting the scheduler