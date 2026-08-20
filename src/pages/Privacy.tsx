import React from 'react';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#1E1E1E] shadow-sm rounded-xl p-8 sm:p-12 border border-gray-200 dark:border-[#333333]">
        
        {/* Header Section */}
        <div className="border-b border-gray-200 dark:border-[#333333] pb-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Apsco Terms & Conditions
          </h1>
          <div className="flex flex-wrap gap-x-6 text-sm text-gray-500 dark:text-[#B0B0B0]">
            <p><span className="font-semibold">Version:</span> 1.0</p>
            <p><span className="font-semibold">Effective Date:</span> 1 November 2026</p>
            <p><span className="font-semibold">Last Updated:</span> 1 November 2026</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-gray-700 dark:text-[#D1D5DB] leading-relaxed">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Introduction</h2>
            <p className="mb-2">Welcome to Apsco.</p>
            <p className="mb-2">
              These Terms & Conditions (“Terms”) govern your access to and use of the Apsco mobile application, website, services, features and related platforms (collectively, the “Platform”).
            </p>
            <p className="mb-2">
              Apsco is an education-technology platform operated from Kampala, Uganda, which enables students, parents and guardians to discover verified schools, compare schools, submit school applications, make applicable admission-fee payments, receive application updates and communicate application information to participating schools.
            </p>
            <p className="mb-2">
              The official Apsco website is <a href="https://apsco.site" className="text-[#1E88E5] hover:underline">https://apsco.site</a>.
            </p>
            <p className="mb-2">
              Apsco is currently operated as an unregistered venture and is not represented in these Terms as an incorporated company unless and until its legal status changes.
            </p>
            <p className="mb-2">
              By creating an account, accessing the Platform, submitting an application or otherwise using Apsco, you agree to be bound by these Terms and our Privacy Policy.
            </p>
            <p>If you do not agree with these Terms, you must not use Apsco.</p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Acceptance of These Terms</h2>
            <p className="mb-2">By using Apsco, you confirm that:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>You have read and understood these Terms;</li>
              <li>You agree to comply with them;</li>
              <li>The information you provide is accurate and not deliberately misleading;</li>
              <li>You have the legal capacity or appropriate parental/guardian authorization necessary to use the relevant Apsco service; and</li>
              <li>Where the law requires parental or guardian consent for the processing of a child's personal data, that consent has been obtained.</li>
            </ul>
            <p className="mt-2">
              Your continued use of Apsco after an updated version of these Terms becomes effective constitutes acceptance of the updated Terms, subject to any rights you may have under applicable law.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Eligibility and Children</h2>
            <p className="mb-2">Apsco is intended for users aged 13 years and above.</p>
            <p className="mb-2">
              However, age eligibility does not replace any consent required under applicable law. Where a user is a child for purposes of applicable Ugandan law, Apsco may require prior consent from a parent, guardian or other person legally authorized to make decisions for the child before collecting or processing the child's personal information.
            </p>
            <p className="mb-2">Parents and guardians are encouraged to create and use Apsco accounts when assisting children with applications.</p>
            <p>
              A parent or guardian who authorizes a child to use Apsco is responsible for appropriate supervision of the child's use of the Platform and for ensuring that payment credentials are used only with proper authorization.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Apsco Accounts</h2>
            <p className="mb-2">Students, parents and guardians may create accounts through the Apsco mobile application.</p>
            <p className="mb-2">Schools and school administrators create and manage accounts through the Apsco website.</p>
            <p className="mb-2">Depending on the account type, Apsco may use an email address, telephone number, password and name or other information necessary to establish and operate the account.</p>
            <p className="mb-2">Users are responsible for maintaining the confidentiality of their login credentials and for activity conducted through their accounts.</p>
            <p className="mb-2 font-semibold">You must not:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>impersonate another person;</li>
              <li>create an account using fraudulent information;</li>
              <li>access another person's account without authorization;</li>
              <li>knowingly provide false information;</li>
              <li>share account credentials in a manner that creates an unreasonable security risk; or</li>
              <li>use Apsco to engage in unlawful or fraudulent conduct.</li>
            </ul>
            <p className="mt-2">
              Apsco may suspend or terminate an account where we reasonably believe that the account is being used for fraud, abuse, suspicious activity, material violations of these Terms or conduct that threatens the Platform or its users.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Discovering and Comparing Schools</h2>
            <p className="mb-2">Apsco allows users to search for and compare participating schools.</p>
            <p className="mb-2">The Platform may provide school information including, but not limited to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>school name, location, curriculum, and school type;</li>
              <li>fees or fees ranges and contact information;</li>
              <li>admission information and application requirements; and</li>
              <li>other information supplied by participating schools or maintained by Apsco.</li>
            </ul>
            <p className="my-2">
              Apsco seeks to verify school information, including through manual verification and, as the Platform develops, potentially through technology-assisted verification.
            </p>
            <p className="mb-2">
              However, Apsco cannot guarantee that every piece of school information will always be completely accurate, current, complete or error-free. School fees, requirements, available places, admission deadlines, curricula, policies and other information may change.
            </p>
            <p>Users should verify important information with the relevant school before making a significant decision.</p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Apsco Map and Location Features</h2>
            <p className="mb-2">Apsco may provide map and location features that allow users to discover Apsco-verified schools near a selected or device-based location. Device location may be requested for this functionality.</p>
            <p className="mb-2">Location access is not required for every use of Apsco. Users may decline location access, although certain location-based features may not function fully.</p>
            <p>Apsco does not guarantee the absolute accuracy of map coordinates, directions, distance calculations or geographic information supplied through third-party mapping or location services.</p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. School Applications</h2>
            <p className="mb-2">Apsco provides a technological platform through which students, parents and guardians can submit applications to participating schools.</p>
            <p className="mb-2">The typical application process may include:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>searching for a school and reviewing its information;</li>
              <li>confirming that admissions are open and selecting the relevant class category;</li>
              <li>completing the application form and reviewing submitted details;</li>
              <li>paying an applicable admission/application fee where required; and</li>
              <li>submitting the application to the school.</li>
            </ul>
            <p className="mt-2">The precise application requirements may differ between schools and may be determined by the school through the Apsco website.</p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Apsco's Role in Admission Decisions</h2>
            <p className="mb-2">Apsco does not admit, reject or otherwise determine whether a student is accepted by a school. Apsco acts primarily as a technology platform and intermediary for the transmission and management of application information between applicants and participating schools.</p>
            <p className="mb-2">The relevant school makes the final admission decision. Accordingly:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>submitting an application does not guarantee admission;</li>
              <li>paying an application fee does not guarantee admission;</li>
              <li>Apsco cannot require a school to accept an applicant;</li>
              <li>Apsco cannot guarantee a particular admission outcome; and</li>
              <li>disputes regarding academic eligibility, admission criteria or admission decisions should be addressed with the relevant school.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">9. Application Information</h2>
            <p className="mb-2">Applicants may be required to provide information such as full name, date of birth, gender, religion, nationality, guardian contact numbers, email addresses, physical addresses, health info, academic history (PLE, UCE scores, LIN), and subject combinations.</p>
            <p className="mb-2">Applicants are responsible for ensuring that information submitted through an application is accurate, complete and truthful to the best of their knowledge.</p>
            <p>Providing materially false, fraudulent or deliberately misleading information may result in rejection of an application, suspension of an account or other action permitted by law.</p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">10. Application Withdrawal and Cancellation</h2>
            <p>Apsco may provide users with an opportunity to review an application before submitting it. Once an application has been submitted, certain aspects of the current system may not be reversible. Nothing in these Terms limits any mandatory statutory right under applicable Ugandan law.</p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">11. Application Status and Notifications</h2>
            <p className="mb-2">Apsco may display application statuses such as pending, accepted or rejected, and send notifications when a status changes.</p>
            <p>Apsco is not responsible for delays caused by internet connectivity, device settings, third-party notification infrastructure or circumstances outside reasonable control.</p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">12. Admission and Application Fees</h2>
            <p className="mb-2">Participating schools set their own admission or application fees. Apsco does not determine the amount charged by schools.</p>
            <p className="mb-2">Apsco currently does not charge students or parents a separate platform fee for submitting applications.</p>
            <p>Apsco may charge participating schools a transaction/service fee equivalent to 4% of an admission fee paid through the Platform.</p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">13. Payments</h2>
            <p className="mb-2">Payments made through Apsco may be processed using supported payment methods including MTN Mobile Money, Airtel Money, and payment cards via Flutterwave.</p>
            <p>Apsco does not intentionally collect or store full card credentials. We do not control fees, limits, or authorization policies imposed by external providers.</p>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">14. Refunds and Failed Payments</h2>
            <p>Where a payment has been made and a refund is legitimately due, Apsco will use reasonable efforts to assist with resolving the matter through customer support, depending on the circumstances of the transaction and school policy.</p>
          </section>

          {/* Section 15 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">15. School Accounts and Responsibilities</h2>
            <p>Schools manage profiles through the website, ensuring accurate information (logos, curricula, contacts, fees, statuses) is maintained and used strictly for legitimate school-related purposes.</p>
          </section>

          {/* Section 16 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">16. School Verification</h2>
            <p>Apsco conducts manual or automated verification processes for schools, but verification does not constitute a permanent guarantee of compliance or suitability.</p>
          </section>

          {/* Section 17 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">17. Ratings and Reviews</h2>
            <p>If ratings and reviews features are introduced, users are strictly prohibited from submitting fraudulent, abusive, or defamatory content.</p>
          </section>

          {/* Section 18 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">18. Prohibited Uses</h2>
            <p className="mb-2">You must not use Apsco to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>submit fraudulent applications or impersonate individuals;</li>
              <li>create fake school accounts or interfere with platform security;</li>
              <li>introduce malicious software or scrape content without permission;</li>
              <li>abuse payment systems or harass other users.</li>
            </ul>
          </section>

          {/* Section 19 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">19. Intellectual Property</h2>
            <p>The Apsco name, branding, source code, logos, and original materials are protected by applicable intellectual property laws and are retained by platform owner <strong>Nkono Jeremie</strong>.</p>
          </section>

          {/* Section 20 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">20. Third-Party Services</h2>
            <p>Apsco relies on third-party infrastructure including Supabase, Vercel, Flutterwave, Twilio, and Google Analytics, each governed by their respective terms.</p>
          </section>

          {/* Section 21 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">21. Service Availability</h2>
            <p>While we aim for high uptime, the platform may occasionally be unavailable due to maintenance, network outages, or circumstances beyond reasonable control.</p>
          </section>

          {/* Section 22 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">22. User-Generated and Submitted Information</h2>
            <p>You retain responsibility for information you submit, authorizing Apsco to transmit your application details to your chosen school.</p>
          </section>

          {/* Section 23 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">23. Privacy</h2>
            <p>Data handling is governed by the official Apsco Privacy Policy, incorporated into these Terms by reference.</p>
          </section>

          {/* Section 24 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">24. Account Suspension and Termination</h2>
            <p>Apsco reserves the right to suspend or terminate accounts for violations of these Terms, fraudulent activity, or security threats. Users may also request deletion of their accounts.</p>
          </section>

          {/* Section 25 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">25. Disclaimers</h2>
            <p>Apsco is provided on an "as available" basis without guarantees regarding admission outcomes, uninterrupted operations, or absolute accuracy of third-party systems.</p>
          </section>

          {/* Section 26 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">26. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Apsco is not liable for losses arising from matters outside its reasonable control, such as third-party payment failures or school admission decisions.</p>
          </section>

          {/* Section 27 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">27. Indemnity</h2>
            <p>Users who intentionally misuse the platform or commit fraud may be held responsible for resulting direct losses or expenses.</p>
          </section>

          {/* Section 28 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">28. Complaints and Dispute Resolution</h2>
            <p className="mb-2">Users are encouraged to reach out to support first for prompt investigations:</p>
            <p><strong>Email:</strong> apscoschool@gmail.com | <strong>WhatsApp:</strong> 0785833340</p>
          </section>

          {/* Section 29 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">29. Governing Law</h2>
            <p>These Terms are governed by and construed in accordance with the laws of the Republic of Uganda.</p>
          </section>

          {/* Section 30 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">30. Changes to These Terms</h2>
            <p>Apsco may update these Terms periodically, posting the new effective date directly on this page.</p>
          </section>

          {/* Section 31 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">31. Severability</h2>
            <p>If any provision of these Terms is found invalid or unenforceable, the remaining provisions remain fully in effect.</p>
          </section>

          {/* Section 32 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">32. Entire Agreement</h2>
            <p>These Terms and the Privacy Policy constitute the principal agreement governing platform usage.</p>
          </section>

          {/* Section 33 */}
          <section className="border-t border-gray-200 dark:border-[#333333] pt-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">33. Contact Information</h2>
            <p className="font-semibold text-gray-900 dark:text-white">Apsco</p>
            <p>Kampala, Uganda</p>
            <p>Website: <a href="https://apsco.site" className="text-[#1E88E5] hover:underline">https://apsco.site</a></p>
            <p>Email: apscoschool@gmail.com</p>
            <p>WhatsApp: 0785833340</p>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#2A2A2A] text-sm text-gray-500">
              <p>Chief Executive Officer: Nkono Jeremie</p>
              <p>Chief Financial Officer: Kakooza Ivan</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}