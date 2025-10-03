// This is our in-memory database (server-side only)
// In a real app, this would be a database

export type ChatMessage = {
	id: number;
	username: string;
	message: string;
	timestamp: Date;
};

let messages: ChatMessage[] = [
	{
		id: 1,
		username: 'System',
		message: 'Welcome to the chat!',
		timestamp: new Date()
	}
];

let nextId = 2;

export const chatStore = {
	// Get all messages
	getMessages(): ChatMessage[] {
		return messages;
	},

	// Add a new message
	addMessage(username: string, message: string): ChatMessage {
		const newMessage: ChatMessage = {
			id: nextId++,
			username,
			message,
			timestamp: new Date()
		};
		messages.push(newMessage);
		return newMessage;
	},

	// Clear all messages
	clearMessages(): void {
		messages = [];
		nextId = 1;
	}
};
