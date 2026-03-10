<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
</script>

<template>
  <div class="min-h-svh bg-muted/30 px-4 py-8 md:px-8 md:py-12">
    <div class="mx-auto w-full max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle class="text-3xl font-bold">Privacy Policy</CardTitle>
          <CardDescription><strong>Last Updated:</strong> March 2026</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6 text-left leading-7 text-sm md:text-base">
          <p>
            This Privacy Policy explains how the University Finder System collects, uses, and protects user
            information when using the platform.
          </p>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">1. Information We Collect</h2>
            <p>The system may collect the following information:</p>
            <ul class="list-disc space-y-1 pl-6">
              <li>Email address and account credentials</li>
              <li>Personal profile information</li>
              <li>Educational background</li>
              <li>Academic results and achievements</li>
              <li>Internship and project experience</li>
              <li>Uploaded curriculum vitae (CV)</li>
              <li>Saved universities and preferences</li>
              <li>Interactions with the AI chat system</li>
            </ul>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">2. How We Use Your Information</h2>
            <p>The collected information is used to:</p>
            <ul class="list-disc space-y-1 pl-6">
              <li>Provide personalized university recommendations</li>
              <li>Improve the accuracy of the AI recommendation system</li>
              <li>Allow users to manage their profiles</li>
              <li>Enable CV parsing and automatic profile population</li>
              <li>Improve the overall functionality of the platform</li>
            </ul>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">3. AI Processing</h2>
            <p>
              Information provided by users, including profile data and uploaded CV documents, may be processed by
              Artificial Intelligence models to generate recommendations and suggestions. These models analyze user
              information to provide more relevant university options.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">4. Data Storage</h2>
            <p>
              User information is stored within the system database and is used solely for the operation of the
              University Finder System.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">5. Data Security</h2>
            <p>
              Reasonable technical and organizational measures are implemented to protect user data from unauthorized
              access, misuse, or disclosure.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">6. Data Sharing</h2>
            <p>
              The University Finder System does not sell, trade, or rent users' personal information to third
              parties. Data is used only within the platform to provide services and recommendations.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">7. User Control</h2>
            <p>
              Users may update or modify their profile information through the account settings page. Users may also
              remove saved universities from their favorites list.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">8. Uploaded Documents</h2>
            <p>
              When a user uploads a CV, the document may be processed by the system to extract relevant information
              such as education, experience, and skills. This information may be added to the user's profile
              automatically.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">9. Changes to This Policy</h2>
            <p>
              This Privacy Policy may be updated periodically to reflect changes in system functionality or data
              practices.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">10. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy or how your data is handled, please contact the
              system administrators.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
