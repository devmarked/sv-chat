import { chatStore } from '$lib/chat-store';

// This runs on the server before the page loads
// Similar to getServerSideProps in Next.js
export const load = async () => {
	const messages = chatStore.getMessages();
	
	return {
		messages
	};
};
