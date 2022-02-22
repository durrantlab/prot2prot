import { setupQueueCatcher } from "./QueueCatcher.vue";
import { setupQueueController } from "./QueueController.Vue";
import { setupQueueTimer } from "./QueueTimer.Vue";

export function setupQueueSystem() {
    setupQueueTimer();
    setupQueueController();
    setupQueueCatcher();
}