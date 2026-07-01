export function TermsOfServiceContent() {
  return (
    <article className="space-y-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
      <header className="space-y-2 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <h1 className="text-3xl font-bold text-[#003262] dark:text-[#FDB515]">
          Terms of Service
        </h1>
        <p className="text-zinc-500">Last updated: July 2026</p>
        <p>
          Welcome to Calket, a student-run marketplace for the
          University of California, Berkeley community. By using this site, you
          agree to these terms. Please read them.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Eligibility
        </h2>
        <p>
          Calket is open only to current University of California,
          Berkeley students, alumni, faculty, and staff. You must sign in with a
          valid @berkeley.edu email address via Google OAuth. One account per
          person.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Account Rules
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>You are responsible for all activity under your account.</li>
          <li>Do not share your login credentials with others.</li>
          <li>
            You must verify your phone number before posting listings or
            messaging other users.
          </li>
          <li>
            Creating multiple accounts or impersonating another person is not
            allowed.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Acceptable Use
        </h2>
        <p>You agree not to use Calket to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            List or sell prohibited items, including illegal goods, weapons,
            controlled substances, or anything that violates University policy.
          </li>
          <li>
            Engage in fraud, scams, or misrepresentation of items being sold.
          </li>
          <li>Harass, threaten, or abuse other users in any way.</li>
          <li>Spam other users with unsolicited messages or listings.</li>
          <li>
            Attempt to access or interfere with systems or other users&apos;
            accounts.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Your Content
        </h2>
        <p>
          You own the content you post (listings, photos, messages). By posting
          it, you grant Calket a limited license to display and store
          your content as needed to operate the platform. We will not use your
          content for advertising or sell it to third parties. You are
          responsible for ensuring that anything you post does not violate anyone
          else&apos;s rights.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Transactions
        </h2>
        <p>
          All transactions on Calket are conducted in person between
          buyers and sellers. We do not process payments and are not a party to
          any transaction. We are not responsible for the condition of items
          sold, failed meetups, or disputes between users. Use good judgment and
          meet in safe, public locations.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Reviews &amp; Ratings
        </h2>
        <p>
          After completing a transaction, both parties may leave a review for the
          other. Reviews are permanent and cannot be edited or deleted once
          submitted. Please ensure your review is honest, accurate, and respectful
          before submitting. Reviews that violate our community standards (e.g.,
          harassment, defamation, or spam) may be removed by our team. By
          submitting a review, you confirm that it reflects your genuine
          experience with the transaction.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Limitation of Liability
        </h2>
        <p>
          Calket is provided as-is by a student volunteer team. We make
          no warranties about the reliability, availability, or accuracy of the
          platform. To the maximum extent permitted by law, we are not liable for
          any damages arising from your use of the site, transactions between
          users, or content posted by users.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Account Suspension
        </h2>
        <p>
          We reserve the right to suspend or terminate accounts that violate
          these terms, engage in fraudulent activity, or otherwise harm the
          community. We will make reasonable efforts to notify you if your
          account is suspended, but are not obligated to do so in cases of
          serious violations.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Changes to Terms
        </h2>
        <p>
          We may update these terms from time to time. Continued use of the
          platform after changes are posted constitutes acceptance of the updated
          terms. We will update the &ldquo;Last updated&rdquo; date at the top of
          this page when changes are made.
        </p>
      </section>

      <section className="space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Contact
        </h2>
        <p>
          Questions or concerns? Reach us at{" "}
          <a
            href="mailto:jongsuhpark@berkeley.edu"
            className="font-medium text-[#003262] underline dark:text-[#FDB515]"
          >
            jongsuhpark@berkeley.edu
          </a>
        </p>
      </section>
    </article>
  );
}
