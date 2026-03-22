import { z } from "zod";

export const linkedInDataSchema = z.object({
  profile: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      headline: z.string().optional(),
      summary: z.string().optional(),
      linkedinUrl: z.string().optional(),
    })
    .optional(),
  positions: z.array(
    z.object({
      companyName: z.string(),
      title: z.string(),
      description: z.string().optional(),
      location: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      current: z.boolean(),
    }),
  ),
  education: z.array(
    z.object({
      schoolName: z.string(),
      degreeName: z.string().optional(),
      notes: z.string().optional(),
      activities: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
  ),
  skills: z.array(z.object({ name: z.string() })),
  certifications: z.array(
    z.object({
      name: z.string(),
      authority: z.string().optional(),
      licenseNumber: z.string().optional(),
      url: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
  ),
  languages: z.array(
    z.object({
      name: z.string(),
      proficiency: z.string().optional(),
    }),
  ),
});

export type LinkedInData = z.infer<typeof linkedInDataSchema>;
export type LinkedInProfile = NonNullable<LinkedInData["profile"]>;
export type LinkedInPosition = LinkedInData["positions"][number];
export type LinkedInEducation = LinkedInData["education"][number];
export type LinkedInSkill = LinkedInData["skills"][number];
export type LinkedInCertification = LinkedInData["certifications"][number];
export type LinkedInLanguage = LinkedInData["languages"][number];
