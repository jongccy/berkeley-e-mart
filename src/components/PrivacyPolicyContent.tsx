export function PrivacyPolicyContent() {
  return (
    <article className="space-y-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
      <header className="space-y-2 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <h1 className="text-3xl font-bold text-[#003262] dark:text-[#FDB515]">
          Privacy Policy
        </h1>
        <p className="text-zinc-500">Last updated: April 2026</p>
        <p>
          Calket is a student-run marketplace for University of
          California, Berkeley students. This privacy policy explains what data
          we collect, how we use it, and your rights regarding that data. We
          keep things simple — this is a student project, not a corporation.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          What We Collect
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              Account information:
            </span>{" "}
            Your name and Berkeley email address (obtained via Google OAuth when
            you sign in).
          </li>
          <li>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              Profile photo:
            </span>{" "}
            Pulled from your Google account or uploaded by you.
          </li>
          <li>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              Post content and images:
            </span>{" "}
            Listings you create, including descriptions, prices, and any photos
            you upload.
          </li>
          <li>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              Messages:
            </span>{" "}
            Direct messages sent between users through the platform.
          </li>
          <li>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              Usage data:
            </span>{" "}
            Basic information about how you interact with the site (e.g., pages
            visited, posts saved), used to improve the experience.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          How We Use It
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>To create and manage your account.</li>
          <li>
            To verify that you are a UC Berkeley student and to reduce fraud and
            spam.
          </li>
          <li>To display your listings and profile to other verified users.</li>
          <li>To facilitate messaging between buyers and sellers.</li>
          <li>
            To send notifications about activity on your listings or account.
          </li>
          <li>To improve the platform based on how it is used.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Third-Party Services
        </h2>
        <p>
          We rely on a small number of third-party services to operate the
          platform:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              Google OAuth:
            </span>{" "}
            Used for sign-in. Google provides your name and email address to us.
            Google&apos;s privacy policy applies to the authentication flow.
          </li>
          <li>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              Firebase (Google):
            </span>{" "}
            Used for phone number verification and for storing uploaded images.
            Data is stored in Google Cloud infrastructure.
          </li>
          <li>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              Railway / PostgreSQL:
            </span>{" "}
            Our database is hosted on Railway. User data (account info, posts,
            messages) is stored there.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Data Sharing
        </h2>
        <p>
          We do not sell your data. We do not share your personal information
          with third parties for advertising or marketing purposes. Your data is
          shared only with the services listed above as necessary to operate the
          platform, and with other Calket users as part of normal
          marketplace functionality (e.g., your name and listings are visible to
          other users; your phone number is only visible if you choose to show
          it).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Data Retention
        </h2>
        <p>
          We retain your account data for as long as your account is active. If
          you request account deletion, we will remove your personal information
          from our systems within a reasonable time. Some information may be
          retained in backups for a short period after deletion.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Your Rights
        </h2>
        <p>
          You can request access to, correction of, or deletion of your personal
          data at any time by contacting us. To request account deletion or data
          export, email us at{" "}
          <a
            href="mailto:jongsuhpark@berkeley.edu"
            className="font-medium text-[#003262] underline dark:text-[#FDB515]"
          >
            jongsuhpark@berkeley.edu
          </a>
        </p>
      </section>

      <section className="space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Contact
        </h2>
        <p>
          Questions about this policy? Reach out at{" "}
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
