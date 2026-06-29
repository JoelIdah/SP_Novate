import type { SignUpRole } from "../types";

type PersonalReviewState = {
  lastName: string;
  firstName: string;
  otherName: string;
  dob: string;
  email: string;
  phoneNumber: string;
  occupation: string;
  qualification: string;
  bio: string;
};

type IdentificationReviewState = {
  employerShareCode: string;
  dbsCertificateNumber: string;
  idType: string;
  idDocumentName: string;
};

type CompensationReviewState = {
  lastName: string;
  firstName: string;
  accountNumber: string;
  sortCode: string;
};

type ReviewInformationStepProps = {
  role: SignUpRole | null;
  greetingName: string;
  personalForm: PersonalReviewState;
  identificationForm: IdentificationReviewState;
  compensationForm: CompensationReviewState;
  fullAddress: string;
  mapEmbedUrl: string;
  reviewConfirmed: boolean;
  onReviewConfirmedChange: (checked: boolean) => void;
  onEditPersonal: () => void;
  onEditIdentification: () => void;
  onEditCompensation: () => void;
  onEditLocation: () => void;
};

function ReviewCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-[0.72rem] border border-[#e2e5ef] bg-[#f6f7fb] p-2.5">
      <div className="flex items-center justify-between rounded-[0.58rem] bg-[#eef0f6] px-3 py-2">
        <h3 className="flex items-center gap-2 text-[0.76rem] font-semibold text-[#303954]">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#3d3bb8] text-[0.62rem] text-white">o</span>
          {title}
        </h3>
        <button className="text-[0.7rem] font-semibold text-[#5652c9] hover:text-[#423eb2]" onClick={onEdit} type="button">
          Edit
        </button>
      </div>
      <div className="mt-1.5 rounded-[0.58rem] border border-[#ebedf4] bg-white px-3 py-2.5">{children}</div>
    </article>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.66rem] text-[#8c93a7]">{label}</p>
      <p className="mt-0.5 text-[0.76rem] font-medium text-[#2f3650]">{value || "-"}</p>
    </div>
  );
}

export function ReviewInformationStep({
  role,
  greetingName,
  personalForm,
  identificationForm,
  compensationForm,
  fullAddress,
  mapEmbedUrl,
  reviewConfirmed,
  onReviewConfirmedChange,
  onEditPersonal,
  onEditIdentification,
  onEditCompensation,
  onEditLocation,
}: ReviewInformationStepProps) {
  return (
    <div className="pb-5">
      <div className="mb-4 text-center">
        <h2 className="text-[2rem] font-bold tracking-[-0.02em] text-[#1d2331]">Hey {greetingName}!</h2>
        <p className="mt-1.5 text-[0.78rem] font-medium text-[#8c93a7]">Please confirm all the information provided is correct.</p>
      </div>

      <div className="space-y-3">
        <ReviewCard onEdit={onEditPersonal} title="Personal information">
          <div className="space-y-3">
            <div>
              <p className="text-[0.68rem] font-semibold text-[#5d6479]">Personal information</p>
              <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-2 border-b border-[#edf0f6] pb-2">
                <ReviewField label="Last Name" value={personalForm.lastName} />
                <ReviewField label="First Name" value={personalForm.firstName} />
                <ReviewField label="Other name" value={personalForm.otherName} />
                <ReviewField label="Date of birth" value={personalForm.dob} />
              </div>
            </div>

            <div>
              <p className="text-[0.68rem] font-semibold text-[#5d6479]">Contact information</p>
              <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-2 border-b border-[#edf0f6] pb-2">
                <ReviewField label="Email" value={personalForm.email} />
                <ReviewField label="Phone number" value={personalForm.phoneNumber ? `+234 ${personalForm.phoneNumber}` : ""} />
              </div>
            </div>

            {role === "tutor" ? (
              <div>
                <p className="text-[0.68rem] font-semibold text-[#5d6479]">Professional information</p>
                <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-2">
                  <ReviewField label="Occupation" value={personalForm.occupation} />
                  <ReviewField label="Qualification" value={personalForm.qualification} />
                  <div className="col-span-2">
                    <ReviewField label="Tell us about your experience" value={personalForm.bio} />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </ReviewCard>

        {role === "tutor" ? (
          <ReviewCard onEdit={onEditIdentification} title="Identification verification">
            <div className="space-y-3">
              <div>
                <p className="text-[0.68rem] font-semibold text-[#5d6479]">Right to work (UK)</p>
                <div className="mt-1.5 border-b border-[#edf0f6] pb-2">
                  <ReviewField label="Employer share code" value={identificationForm.employerShareCode} />
                </div>
              </div>

              <div>
                <p className="text-[0.68rem] font-semibold text-[#5d6479]">Background check</p>
                <div className="mt-1.5 border-b border-[#edf0f6] pb-2">
                  <ReviewField label="DBS certificate number" value={identificationForm.dbsCertificateNumber} />
                </div>
              </div>

              <div>
                <p className="text-[0.68rem] font-semibold text-[#5d6479]">Identification document</p>
                <div className="mt-1.5 space-y-2">
                  <ReviewField label="Identification type" value={identificationForm.idType} />
                  <div className="rounded-md border border-[#eceff6] bg-[#fafbff] px-2.5 py-2">
                    <p className="text-[0.7rem] font-medium text-[#373e57]">{identificationForm.idDocumentName || "No document uploaded yet"}</p>
                    <p className="text-[0.62rem] text-[#8c93a7]">200 KB</p>
                  </div>
                </div>
              </div>
            </div>
          </ReviewCard>
        ) : null}

        {role === "tutor" ? (
          <ReviewCard onEdit={onEditCompensation} title="Compensation details">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <ReviewField label="Last Name" value={compensationForm.lastName} />
              <ReviewField label="First Name" value={compensationForm.firstName} />
              <ReviewField label="Account number" value={compensationForm.accountNumber} />
              <ReviewField label="Sort code" value={compensationForm.sortCode} />
            </div>
          </ReviewCard>
        ) : null}

        <ReviewCard onEdit={onEditLocation} title="Location access">
          <div className="space-y-2">
            <ReviewField label="Address" value={fullAddress} />
            <div className="overflow-hidden rounded-md border border-[#e7eaf3]">
              {mapEmbedUrl ? (
                <iframe className="h-[220px] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={mapEmbedUrl} title="Confirmed location map" />
              ) : (
                <div className="flex h-[220px] items-center justify-center text-sm text-[#8c93a7]">Map preview unavailable</div>
              )}
            </div>
          </div>
        </ReviewCard>
      </div>

      <label className="mt-4 flex items-center gap-2 rounded-md border border-[#dfe3ee] bg-white px-3 py-2 text-[0.72rem] text-[#4f586f]">
        <input checked={reviewConfirmed} className="h-4 w-4 accent-[#4f4ac8]" onChange={(e) => onReviewConfirmedChange(e.target.checked)} type="checkbox" />
        I confirm that the information I&apos;ve provided is accurate.
      </label>
    </div>
  );
}


