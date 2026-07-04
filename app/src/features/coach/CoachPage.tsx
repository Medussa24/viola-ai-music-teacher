import { Send } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import type { TeacherMessage } from "../../core/domain";
import type { MusicTeacherService } from "../../services/contracts";
import { Button } from "../../shared/ui/Button";
import { PageHeader } from "../../shared/ui/PageHeader";

type CoachPageProps = {
  musicTeacherService: MusicTeacherService;
};

export function CoachPage({ musicTeacherService }: CoachPageProps) {
  const [messages, setMessages] = useState<TeacherMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    void musicTeacherService.getTeacherThread().then(setMessages);
  }, [musicTeacherService]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = draft.trim();

    if (!trimmed || isSending) {
      return;
    }

    const studentMessage: TeacherMessage = {
      id: crypto.randomUUID(),
      role: "student",
      content: trimmed,
    };

    setMessages((current) => [...current, studentMessage]);
    setDraft("");
    setIsSending(true);

    const teacherReply = await musicTeacherService.sendTeacherMessage({ message: trimmed });
    setMessages((current) => [...current, teacherReply]);
    setIsSending(false);
  }

  return (
    <section className="page-stack coach-page">
      <PageHeader eyebrow="AI teacher" title="Coach Chat" />

      <section className="coach-support-panel">
        <article>
          <span>Student lesson support</span>
          <p>Ask for note explanations, practice ideas, motivation, feedback summaries, and next-step suggestions.</p>
        </article>
        <article>
          <span>Teacher planning support</span>
          <p>Draft assignment ideas, student feedback notes, lesson plans, and review summaries from practice activity.</p>
        </article>
      </section>

      <div className="chat-panel">
        <div className="message-list">
          {messages.map((message) => (
            <article className={`message ${message.role}`} key={message.id}>
              <span>{message.role === "teacher" ? "Teacher" : "You"}</span>
              <p>{message.content}</p>
            </article>
          ))}
          {isSending ? (
            <article className="message teacher">
              <span>Teacher</span>
              <p>Thinking through the next best correction...</p>
            </article>
          ) : null}
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <input
            aria-label="Message"
            placeholder="Ask for a lesson explanation, practice idea, feedback draft, or next step"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <Button aria-label="Send message" disabled={isSending || draft.trim().length === 0} type="submit">
            <Send size={18} />
          </Button>
        </form>
      </div>
    </section>
  );
}
