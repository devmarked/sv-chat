<script lang="ts">
	import type { ChatMessage } from '$lib/chat-store';

	// data comes from the load function in +page.server.ts
	let { data }: { data: { messages: ChatMessage[] } } = $props();

	// Reactive state for messages (Svelte 5 syntax with $state)
	let messages = $state<ChatMessage[]>(data.messages);
	let username = $state('Guest');
	let newMessage = $state('');
	let isLoading = $state(false);

	// Auto-scroll to bottom when new messages arrive
	let chatContainer: HTMLDivElement;

	// Fetch messages from API
	async function fetchMessages() {
		try {
			const response = await fetch('/api/messages');
			if (response.ok) {
				messages = await response.json();
				scrollToBottom();
			}
		} catch (error) {
			console.error('Failed to fetch messages:', error);
		}
	}

	// Send a new message
	async function sendMessage() {
		if (!newMessage.trim() || isLoading) return;

		isLoading = true;
		try {
			const response = await fetch('/api/messages', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username,
					message: newMessage
				})
			});

			if (response.ok) {
				newMessage = ''; // Clear input
				await fetchMessages(); // Refresh messages
			}
		} catch (error) {
			console.error('Failed to send message:', error);
		} finally {
			isLoading = false;
		}
	}

	// Handle form submission
	function handleSubmit(event: Event) {
		event.preventDefault();
		sendMessage();
	}

	// Auto-scroll to bottom
	function scrollToBottom() {
		setTimeout(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 0);
	}

	// Poll for new messages every 2 seconds
	$effect(() => {
		const interval = setInterval(fetchMessages, 2000);
		return () => clearInterval(interval);
	});

	// Format timestamp
	function formatTime(timestamp: Date | string): string {
		const date = new Date(timestamp);
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Check if message is from current user
	function isOwnMessage(msg: ChatMessage): boolean {
		return msg.username === username;
	}
</script>

<div class="flex h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
	<!-- Header -->
	<header class="border-b border-blue-700 bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 shadow-md">
		<div class="mx-auto flex max-w-4xl items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
					<span class="text-2xl">💬</span>
				</div>
				<h1 class="text-2xl font-bold text-white">SvelteKit Chat</h1>
			</div>
			<div class="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
				<div class="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></div>
				<span class="text-sm font-medium text-white">{messages.length} messages</span>
			</div>
		</div>
	</header>

	<!-- Main Content Container -->
	<div class="flex flex-1 overflow-hidden">
		<div class="mx-auto flex w-full max-w-4xl flex-col p-6">
			
			<!-- Username Section -->
			<div class="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
				<label for="username" class="text-sm font-semibold text-slate-700">
					Username:
				</label>
				<input
					id="username"
					type="text"
					bind:value={username}
					placeholder="Enter your name"
					class="w-64 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
				/>
			</div>

			<!-- Messages Area -->
			<div
				bind:this={chatContainer}
				class="mb-6 flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm"
			>
				{#if messages.length === 0}
					<div class="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
						<div class="mb-4 text-6xl opacity-20">💭</div>
						<p class="text-lg font-medium text-slate-400">No messages yet</p>
						<p class="mt-1 text-sm text-slate-400">Be the first to start the conversation!</p>
					</div>
				{:else}
					<div class="space-y-4 p-6">
						{#each messages as msg (msg.id)}
							{#if isOwnMessage(msg)}
								<!-- Own Message (Right) -->
								<div class="flex justify-end">
									<div class="max-w-lg">
										<div class="mb-1.5 text-right text-xs font-medium text-slate-500">
											{msg.username} · {formatTime(msg.timestamp)}
										</div>
										<div class="rounded-2xl rounded-tr-sm bg-blue-500 px-4 py-3 shadow-sm">
											<p class="break-words text-sm leading-relaxed text-white">
												{msg.message}
											</p>
										</div>
									</div>
								</div>
							{:else}
								<!-- Other's Message (Left) -->
								<div class="flex justify-start">
									<div class="max-w-lg">
										<div class="mb-1.5 text-xs font-medium text-slate-500">
											{msg.username} · {formatTime(msg.timestamp)}
										</div>
										<div class="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 shadow-sm">
											<p class="break-words text-sm leading-relaxed text-slate-800">
												{msg.message}
											</p>
										</div>
									</div>
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</div>

			<!-- Message Input -->
			<form onsubmit={handleSubmit} class="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
				<input
					type="text"
					bind:value={newMessage}
					placeholder="Type your message..."
					disabled={isLoading}
					class="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
				/>
				<button
					type="submit"
					disabled={isLoading || !newMessage.trim()}
					class="rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:opacity-60"
				>
					{isLoading ? 'Sending...' : 'Send'}
				</button>
			</form>
		</div>
	</div>
</div>