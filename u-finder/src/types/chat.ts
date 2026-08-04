// This code was completed by GRP Team 2025.11.
export type ProgramCardData = {
	university: {
		name: string;
		country: string | null;
		city: string | null;
		official_website: string;
	};
	faculty: {
		name: string | null;
		official_website: string | null;
	};
	degree_program: {
		name: string;
		degree_level: string;
		field: string;
		track_or_specialization: string | null;
		program_type: string;
		duration: string | null;
		language: string | null;
	};
	admissions: {
		academic_requirements: string | null;
		language_requirements: string | null;
		other_requirements: string | null;
		application_deadline: string | null;
	};
	tuition: {
		amount: number | null;
		currency: string | null;
		per: string | null;
	};
	career_outcomes: string[] | null;
	official_program_url: string;
	/** Removed from the current program-card schema; kept optional for legacy stored data. */
	last_verified?: string;
};

export type ChatMessageData = {
	id: string;
	role: "user" | "ai";
	type: "text" | "cards";
	content?: string;
	tailContent?: string;
	cards?: ProgramCardData[];
	isLoading?: boolean;
	isUniversityCardLoading?: boolean;
	/** Dify message UUID used for feedback API calls (distinct from the synthetic Vue key `id`) */
	difyMessageId?: string;
	/** Current feedback state for this message; null means no feedback or revoked */
	feedback?: "like" | "dislike" | null;
};

// Conversation types for history feature
export type ConversationItem = {
	id: string;
	name: string;
	inputs: Record<string, any>;
	status: string;
	introduction?: string;
	created_at: number;
	updated_at: number;
};

export type ConversationsResponse = {
	limit: number;
	has_more: boolean;
	data: ConversationItem[];
};

export type ConversationMessage = {
	id: string;
	conversation_id: string;
	inputs: Record<string, any>;
	query: string;
	answer: string;
	message_files: Array<{
		id: string;
		type: string;
		url: string;
		belongs_to: string;
	}>;
	feedback: {
		rating: string;
	} | null;
	retriever_resources: string[];
	created_at: number;
	agent_thoughts: Array<{
		id: string;
		chain_id: string | null;
		message_id: string;
		position: number;
		thought: string;
		tool: string;
		tool_input: string;
		created_at: number;
		observation: string;
		files: string[];
	}>;
};

export type ConversationMessagesResponse = {
	limit: number;
	has_more: boolean;
	data: ConversationMessage[];
};

export type DeleteConversationResponse = {
	result: string;
};

export type RenameConversationRequest = {
	name: string;
};

export type RenameConversationResponse = {
	result: string;
};