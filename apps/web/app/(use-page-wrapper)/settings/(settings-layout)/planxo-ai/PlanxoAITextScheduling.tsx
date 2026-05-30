"use client";

import { createBooking } from "@calcom/features/bookings/lib/create-booking";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui/components/button";
import { TextAreaField } from "@calcom/ui/components/form";
import { Form, TextField } from "@calcom/ui/components/form/fields";
import { showToast } from "@calcom/ui/components/toast";
import dayjs from "dayjs";
import { useState } from "react";

export function PlanxoAITextScheduling() {
  const [params, setParams] = useState({
    username: "",
    eventSlug: "",
    date: "",
    timeZone: "",
  });

  const [selectedSlot, setSelectedSlot] = useState<{ time: string } | null>(null);
  const [logs, setLogs] = useState(
    "assistant: Text scheduling is ready. Pick a date, load times, and confirm a booking."
  );

  // Fetch Event to get Event ID and Duration
  const eventQuery = trpc.viewer.public.event.useQuery(
    {
      username: params.username,
      eventSlug: params.eventSlug,
      isTeamEvent: false,
    },
    {
      enabled: !!params.username && !!params.eventSlug,
    }
  );

  // Parse date into start/end times for schedule query
  const dateObj = params.date ? dayjs(params.date) : null;
  const startTime = dateObj ? dateObj.startOf("month").toISOString() : "";
  const endTime = dateObj ? dateObj.endOf("month").toISOString() : "";

  // Fetch Slots
  const scheduleQuery = trpc.viewer.slots.getSchedule.useQuery(
    {
      isTeamEvent: false,
      usernameList: [params.username],
      eventTypeSlug: params.eventSlug,
      startTime,
      endTime,
      timeZone: params.timeZone,
      duration: eventQuery.data?.length ? `${eventQuery.data.length}` : undefined,
    },
    {
      enabled:
        !!params.username && !!params.eventSlug && !!params.date && !!params.timeZone && !!eventQuery.data,
    }
  );

  const availableSlots = scheduleQuery.data?.slots?.[dateObj ? dateObj.format("YYYY-MM-DD") : ""] || [];

  return (
    <div className="mt-8 flex flex-col gap-6 border-subtle border-t pt-8">
      <div className="flex flex-col gap-2">
        <h2 className="font-cal font-semibold text-xl leading-none">Planxo AI Text Scheduling</h2>
        <p className="text-sm text-subtle">
          Try the same scheduling flow your users get in production, fully text-based and connected to real
          availability.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Fetch Times Form */}
        <div className="rounded-md border border-subtle bg-default p-4 sm:p-6">
          <Form
            form={{
              defaultValues: {
                username: "brandonlacoste9-048b",
                eventSlug: "quick-call-qh8w87",
                date: dayjs().format("YYYY-MM-DD"),
                timeZone: "America/Toronto",
              },
            }}
            handleSubmit={(values) => {
              setParams({
                username: values.username,
                eventSlug: values.eventSlug,
                date: values.date,
                timeZone: values.timeZone,
              });
              setSelectedSlot(null);
              setLogs(
                (prev) =>
                  `${prev}\n\nuser: Load available times for ${values.date}\nassistant: Fetching availability...`
              );
            }}>
            <div className="mb-6 flex flex-col gap-4">
              <TextField name="username" label="Username" />
              <TextField name="eventSlug" label="Event slug" />
              <TextField name="date" label="Date (YYYY-MM-DD)" />
              <TextField name="timeZone" label="Time zone" />
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={scheduleQuery.isFetching}>
                Load available times
              </Button>
            </div>
          </Form>

          <div className="mt-6 border-subtle border-t pt-6">
            <h3 className="mb-2 font-medium text-emphasis">
              {eventQuery.data?.title || "Event"} - {eventQuery.data?.length || "30"} min
            </h3>
            {!params.username || scheduleQuery.isFetching ? (
              <p className="text-sm text-subtle">
                {scheduleQuery.isFetching
                  ? "Loading..."
                  : "No times loaded yet. Use the form above to fetch availability."}
              </p>
            ) : availableSlots.length === 0 ? (
              <p className="text-sm text-subtle text-red-500">No available times found for this date.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableSlots.map((slot) => {
                  const timeString = dayjs(slot.time).format("hh:mm A");
                  return (
                    <Button
                      key={slot.time}
                      type="button"
                      color={selectedSlot?.time === slot.time ? "primary" : "secondary"}
                      variant={selectedSlot?.time === slot.time ? "solid" : "outline"}
                      onClick={() => {
                        setSelectedSlot({ time: slot.time });
                        setLogs(
                          (prev) =>
                            `${prev}\n\nuser: I select ${timeString}\nassistant: Great, what is the guest's name and email?`
                        );
                      }}>
                      {timeString}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Booking Confirmation Form */}
          <div className="rounded-md border border-subtle bg-default p-4 sm:p-6">
            <h3 className="mb-4 font-medium text-emphasis">Confirm booking by text</h3>
            <Form
              form={{
                defaultValues: {
                  guestName: "",
                  guestEmail: "",
                  bookingNotes: "",
                },
              }}
              handleSubmit={async (values) => {
                if (!selectedSlot || !eventQuery.data) return;

                setLogs(
                  (prev) =>
                    `${prev}\n\nuser: Confirm booking for ${values.guestName} (${values.guestEmail})\nassistant: Processing booking...`
                );

                const duration = eventQuery.data.length || 30;
                const endTime = dayjs(selectedSlot.time).add(duration, "minute").toISOString();

                try {
                  await createBooking({
                    end: endTime,
                    eventTypeId: eventQuery.data.id,
                    start: selectedSlot.time,
                    timeZone: params.timeZone,
                    language: "en",
                    metadata: {},
                    responses: {
                      name: values.guestName,
                      email: values.guestEmail,
                      notes: values.bookingNotes,
                    },
                  });
                  setLogs(
                    (prev) => `${prev}\nassistant: Booking confirmed! A calendar invite has been sent.`
                  );
                  showToast("Booking created successfully!", "success");
                } catch (e: any) {
                  setLogs((prev) => `${prev}\nassistant: Failed to book - ${e.message}`);
                  showToast(`Failed to book: ${e.message}`, "error");
                }
              }}>
              <div className="mb-6 flex flex-col gap-4">
                <TextField name="guestName" label="Guest name" />
                <TextField name="guestEmail" label="Guest email" type="email" />
                <TextAreaField name="bookingNotes" label="Booking notes (optional)" />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={!selectedSlot}>
                  Book selected time
                </Button>
              </div>
            </Form>
          </div>

          {/* Session Log */}
          <div className="flex flex-grow flex-col rounded-md border border-subtle bg-default p-4 sm:p-6">
            <h3 className="mb-4 font-medium text-emphasis">Text session log</h3>
            <textarea
              readOnly
              className="min-w-0 w-full flex-grow rounded-md border border-subtle bg-muted p-3 font-mono text-sm text-subtle outline-none"
              value={logs}
              rows={8}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
