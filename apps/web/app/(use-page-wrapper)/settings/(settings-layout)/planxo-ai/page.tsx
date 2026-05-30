"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui/components/button";
import { Form, TextField } from "@calcom/ui/components/form/fields";
import { showToast } from "@calcom/ui/components/toast";
import { useState } from "react";
import { z } from "zod";

const formSchema = z.object({
  elevenLabsAgentId: z.string().optional(),
});

import { PlanxoAITextScheduling } from "./PlanxoAITextScheduling";

export default function PlanxoAI() {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: user, isLoading } = trpc.viewer.me.get.useQuery();
  const mutation = trpc.viewer.me.updateProfile.useMutation({
    onSuccess: () => {
      showToast(t("your_user_profile_updated_successfully"), "success");
      utils.viewer.me.get.invalidate();
    },
    onError: (err) => {
      showToast(err.message, "error");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  if (isLoading || !user) {
    return <div className="p-4">Loading...</div>;
  }

  // Parse existing agent ID from metadata
  const metadata = user.metadata as { elevenLabsAgentId?: string } | null;
  const initialAgentId = metadata?.elevenLabsAgentId || "";

  return (
    <div className="flex flex-col gap-6 p-2 sm:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-cal text-2xl font-semibold leading-none">{t("planxo_ai_voice")}</h1>
        <p className="text-sm text-subtle">{t("planxo_ai_description")}</p>
      </div>

      <div className="rounded-md border border-subtle bg-default p-6">
        <Form
          form={{
            defaultValues: { elevenLabsAgentId: initialAgentId },
            resolver: undefined, // Let simple zod schema or default handle it
          }}
          handleSubmit={(values) => {
            setIsSubmitting(true);
            mutation.mutate({
              metadata: {
                elevenLabsAgentId: values.elevenLabsAgentId,
              },
            });
          }}>
          <div className="mb-6 flex flex-col gap-4">
            <TextField
              name="elevenLabsAgentId"
              label="ElevenLabs Agent ID"
              placeholder="e.g. j39dKls92kdL..."
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting}>
              {t("save")}
            </Button>
          </div>
        </Form>
      </div>

      <PlanxoAITextScheduling />
    </div>
  );
}
