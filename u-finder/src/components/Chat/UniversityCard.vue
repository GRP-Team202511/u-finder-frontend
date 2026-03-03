<script setup lang="ts">
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { ProgramCardData } from "@/types/chat";

const props = defineProps<{ program: ProgramCardData }>();

const locationLabel = () => {
	const parts = [props.program.university.city, props.program.university.country].filter(
		(value) => Boolean(value),
	);
	return parts.length > 0 ? parts.join(", ") : "Location not specified";
};

const tuitionLabel = () => {
	const { amount, currency, per } = props.program.tuition;
	if (amount === null || !currency) {
		return "Tuition not specified";
	}
	return `${currency} ${amount}${per ? ` / ${per}` : ""}`;
};

const formatLanguageRequirements = () => {
	const requirements = props.program.admissions.language_requirements;
	if (!requirements) {
		return "Not specified";
	}
	return Object.entries(requirements)
		.map(([key, value]) => `${key}: ${String(value)}`)
		.join(", ");
};

const formatVerifiedDate = () => {
	const rawDate = props.program.last_verified;
	const parsed = new Date(rawDate);
	if (Number.isNaN(parsed.getTime())) {
		return rawDate || "Not specified";
	}
	return new Intl.DateTimeFormat("en", {
		year: "numeric",
		month: "short",
		day: "2-digit",
	}).format(parsed);
};
</script>

<template>
	<Card>
		<CardHeader>
			<div class="flex items-start justify-between gap-4">
				<div>
					<CardTitle class="text-sm">
						{{ program.university.name }}
					</CardTitle>
					<CardDescription class="mt-1 text-xs">
						{{ locationLabel() }}
					</CardDescription>
				</div>
				<div class="text-right">
					<p class="text-xs text-muted-foreground">Verified</p>
					<p
						class="text-sm font-semibold"
						:title="program.last_verified || undefined"
					>
						{{ formatVerifiedDate() }}
					</p>
				</div>
			</div>
		</CardHeader>
		<CardContent>
			<div class="space-y-4 text-xs">
				<div>
					<p class="text-xs font-semibold text-foreground">Program details</p>
					<div class="mt-2 grid gap-2">
						<div class="flex items-center justify-between gap-4">
							<span class="text-muted-foreground">Program</span>
							<span class="font-semibold">
								{{ program.degree_program.name }}
							</span>
						</div>
						<div class="flex items-center justify-between gap-4">
							<span class="text-muted-foreground">Degree</span>
							<span class="font-semibold">
								{{ program.degree_program.degree_level }}
							</span>
						</div>
						<div class="flex items-center justify-between gap-4">
							<span class="text-muted-foreground">Field</span>
							<span class="font-semibold">
								{{ program.degree_program.field }}
							</span>
						</div>
						<div class="flex items-center justify-between gap-4">
							<span class="text-muted-foreground">Track</span>
							<span class="font-semibold">
								{{ program.degree_program.track_or_specialization ?? "Not specified" }}
							</span>
						</div>
						<div class="flex items-center justify-between gap-4">
							<span class="text-muted-foreground">Type</span>
							<span class="font-semibold">
								{{ program.degree_program.program_type }}
							</span>
						</div>
						<div class="flex items-center justify-between gap-4">
							<span class="text-muted-foreground">Duration</span>
							<span class="font-semibold">
								{{ program.degree_program.duration ?? "Not specified" }}
							</span>
						</div>
						<div class="flex items-center justify-between gap-4">
							<span class="text-muted-foreground">Language</span>
							<span class="font-semibold">
								{{ program.degree_program.language ?? "Not specified" }}
							</span>
						</div>
					</div>
				</div>

				<div>
					<p class="text-xs font-semibold text-foreground">Admissions</p>
					<div class="mt-2 grid gap-2">
						<div class="flex items-center justify-between gap-4">
							<span class="text-muted-foreground">Deadline</span>
							<span class="font-semibold">
								{{ program.admissions.application_deadline ?? "Not specified" }}
							</span>
						</div>
						<div class="flex items-center justify-between gap-4">
							<span class="text-muted-foreground">Language reqs</span>
							<span class="font-semibold">
								{{ formatLanguageRequirements() }}
							</span>
						</div>
						<div class="flex items-center justify-between gap-4">
							<span class="text-muted-foreground">Academic requirements</span>
							<span class="font-semibold">
								{{ program.admissions.academic_requirements ?? "Not specified" }}
							</span>
						</div>
						<div class="flex items-center justify-between gap-4">
							<span class="text-muted-foreground">Other requirements</span>
							<span class="font-semibold">
								{{ program.admissions.other_requirements ?? "Not specified" }}
							</span>
						</div>
					</div>
				</div>

				<div>
					<p class="text-xs font-semibold text-foreground">Tuition</p>
					<div class="mt-2 flex items-center justify-between gap-4">
						<span class="text-muted-foreground">Cost</span>
						<span class="font-semibold">
							{{ tuitionLabel() }}
						</span>
					</div>
				</div>
			</div>
		</CardContent>
		<div class="flex flex-wrap gap-2 px-6 pb-6 text-xs">
			<a
				:href="program.official_program_url"
				class="rounded-md border px-2 py-1 text-muted-foreground transition hover:underline hover:underline-offset-2"
				target="_blank"
				rel="noreferrer"
			>
				Official program page
			</a>
			<a
				:href="program.university.official_website"
				class="rounded-md border px-2 py-1 text-muted-foreground transition hover:underline hover:underline-offset-2"
				target="_blank"
				rel="noreferrer"
			>
				University site
			</a>
			<a
				v-if="program.faculty.official_website"
				:href="program.faculty.official_website"
				class="rounded-md border px-2 py-1 text-muted-foreground transition hover:underline hover:underline-offset-2"
				target="_blank"
				rel="noreferrer"
			>
				Faculty site
			</a>
		</div>
		<div
			v-if="program.career_outcomes && program.career_outcomes.length"
			class="px-6 pb-6 text-xs"
		>
			<p class="text-xs font-semibold text-foreground">Career outcomes</p>
			<ul class="flex flex-wrap gap-2 pt-2">
				<li
					v-for="(outcome, index) in program.career_outcomes"
					:key="index"
				>
					{{ outcome }}
				</li>
			</ul>
		</div>
	</Card>
</template>
