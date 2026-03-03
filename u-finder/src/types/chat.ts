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
		language_requirements: Record<string, unknown> | null;
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
	last_verified: string;
};

export type ChatMessageData = {
	id: string;
	role: "user" | "ai";
	type: "text" | "cards";
	content?: string;
	cards?: ProgramCardData[];
	isLoading?: boolean;
};
