<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "vue-router"

const router = useRouter()
</script>

<template>
  <div class="min-h-svh bg-muted/30 px-4 py-8 md:px-8 md:py-12">
    <div class="mx-auto w-full max-w-4xl">
      <div class="mb-4 flex items-center justify-between">
        <Button variant="outline" type="button" @click="router.push('/signup')">Back to Sign Up</Button>
        <Button type="button" @click="router.push('/privacyPolicy')">View Privacy Policy</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle class="text-3xl font-bold">Terms of Service</CardTitle>
          <CardDescription><strong>Last Updated:</strong> March 2026</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6 text-left leading-7 text-sm md:text-base">
          <p>
            Welcome to the University Finder System. By accessing or using this platform, you agree to be bound by
            the following Terms of Service. If you do not agree with these terms, please do not use the platform.
          </p>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">1. Description of Service</h2>
            <p>
              The University Finder System is a platform designed to help users explore and discover universities
              based on their academic background, interests, and preferences. The platform includes an AI-powered
              recommendation system that provides university suggestions and informational responses through an
              interactive chat interface.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">2. User Accounts</h2>
            <p>
              To access certain features of the platform, users may be required to create an account. Users are
              responsible for maintaining the confidentiality of their login credentials and for all activities that
              occur under their account.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">3. User Information</h2>
            <p>
              Users may provide personal and academic information including educational background, academic
              achievements, internship experience, project experience, and other relevant details. This information is
              used to generate personalized university recommendations.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">4. AI Recommendations</h2>
            <p>
              The platform uses Artificial Intelligence (AI) to provide recommendations and suggestions for
              universities. These recommendations are intended for informational purposes only and should not be
              considered official admission advice or guarantees of acceptance.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">5. CV Upload and Parsing</h2>
            <p>
              Users may upload their curriculum vitae (CV) for automated analysis. The system may extract relevant
              information such as education, skills, projects, and experience in order to populate the user's profile
              and improve recommendation accuracy.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">6. Acceptable Use</h2>
            <p>Users agree not to misuse the platform. Prohibited activities include:</p>
            <ul class="list-disc space-y-1 pl-6">
              <li>Attempting to gain unauthorized access to the system</li>
              <li>Uploading malicious files or harmful content</li>
              <li>Using the platform for unlawful purposes</li>
              <li>Attempting to disrupt or damage the system</li>
            </ul>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">7. Saved Universities</h2>
            <p>
              Users may save recommended universities as favorites for future reference. These saved items are stored
              within the user's account and can be managed through the user dashboard.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">8. Limitation of Liability</h2>
            <p>
              The University Finder System is provided for educational and informational purposes. The platform does
              not guarantee the accuracy, completeness, or suitability of recommendations. The developers are not
              responsible for any decisions made based on the information provided by the system.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">9. Changes to the Service</h2>
            <p>
              The system developers may update or modify the platform and its features at any time without prior
              notice.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">10. Contact</h2>
            <p>
              If you have any questions about these Terms of Service, please contact the system administrators or
              development team.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
