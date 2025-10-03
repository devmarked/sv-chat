import { json } from '@sveltejs/kit';
import { chatStore } from '$lib/chat-store';

// GET /api/messages - Fetch all messages
export const GET = async () => {
	const messages = chatStore.getMessages();
	return json(messages);
};

// POST /api/messages - Add a new message
export const POST = async ({ request }) => {
	const { username, message } = await request.json();

	// Validation
	if (!username || !message) {
		return json({ error: 'Username and message are required' }, { status: 400 });
	}

	if (message.trim().length === 0) {
		return json({ error: 'Message cannot be empty' }, { status: 400 });
	}

	const newMessage = chatStore.addMessage(username, message);
	return json(newMessage, { status: 201 });
};
