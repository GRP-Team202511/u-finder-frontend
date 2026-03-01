<script setup lang="ts">
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type UniversityCardData = {
	id: string;
	name: string;
	location: string;
	program: string;
	tuition: string;
	rating: string;
	highlights: string[];
};

defineProps<{ university: UniversityCardData }>();
</script>

<template>
	<Card>
		<CardHeader>
			<div class="flex items-start justify-between gap-4">
				<div>
					<CardTitle class="text-sm">
						{{ university.name }}
					</CardTitle>
					<CardDescription class="mt-1 text-xs">
						{{ university.location }}
					</CardDescription>
				</div>
				<div class="text-right">
					<p class="text-xs text-muted-foreground">Rating</p>
					<p class="text-sm font-semibold">
						{{ university.rating }}
					</p>
				</div>
			</div>
		</CardHeader>
		<CardContent>
			<div class="grid gap-2 text-xs">
				<div class="flex items-center justify-between gap-4">
					<span class="text-muted-foreground">Program</span>
					<span class="font-semibold">
						{{ university.program }}
					</span>
				</div>
				<div class="flex items-center justify-between gap-4">
					<span class="text-muted-foreground">Tuition</span>
					<span class="font-semibold">
						{{ university.tuition }}
					</span>
				</div>
			</div>
		</CardContent>
		<ul class="flex flex-wrap gap-2 px-6 pb-6">
			<li
				v-for="(highlight, index) in university.highlights"
				:key="index"
				class="rounded-md border px-2 py-1 text-xs text-muted-foreground"
			>
				{{ highlight }}
			</li>
		</ul>
	</Card>
</template>
