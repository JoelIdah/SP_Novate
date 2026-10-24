"use client";

import { ExternalLink, FileText, X } from "lucide-react";
import { useEffect, useMemo } from "react";

import type { TutorReviewDocument } from "./tutorOnboarding";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function displayType(fileType: string, fileName: string) {
  const extension = fileName.split(".").pop();
  const value = fileType.includes("/") ? fileType.split("/").pop() : fileType;
  return (value || extension || "file").replace("jpeg", "jpg").toUpperCase();
}

function DocumentThumbnail({ fileName, fileType, url }: { fileName: string; fileType: string; url: string }) {
  const type = displayType(fileType, fileName).toLowerCase();
  const image = ["jpg", "png", "webp", "gif"].includes(type);

  if (image) {
    return (
      // Blob URLs used for files selected in the browser are not handled reliably by next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={`Preview of ${fileName}`}
        className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
        src={url}
      />
    );
  }

  if (type === "pdf") {
    return (
      <iframe
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-[250%] w-[250%] origin-top-left scale-[0.4] border-0 bg-white"
        src={`${url}#page=1&toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
        tabIndex={-1}
        title={`First page of ${fileName}`}
      />
    );
  }

  return (
    <div className="flex h-full items-center justify-center bg-[#f1f2f8] text-brand-accent">
      <FileText size={38} strokeWidth={1.6} />
    </div>
  );
}

function DocumentCard({ fileName, fileType, meta, onRemove, url }: {
  fileName: string;
  fileType: string;
  meta: string;
  onRemove?: () => void;
  url: string;
}) {
  const content = (
    <>
      <div className="relative h-full w-24 shrink-0 overflow-hidden border-r border-[#e2e6ee] bg-[#f1f2f8] sm:w-28">
        <DocumentThumbnail fileName={fileName} fileType={fileType} url={url} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2.5">
        <p className="line-clamp-2 text-xs font-semibold leading-5 text-[#303a52] sm:text-sm" title={fileName}>{fileName}</p>
        <p className="mt-1 text-xs font-medium text-[#8a93a7]">{meta}</p>
      </div>
      {onRemove ? (
        <button
          aria-label={`Remove ${fileName}`}
          className="mr-2 mt-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#a33f47] hover:bg-red-50"
          onClick={onRemove}
          type="button"
        >
          <X size={14} />
        </button>
      ) : (
        <span className="mr-3 inline-flex h-7 w-7 shrink-0 items-center justify-center self-center rounded-full text-brand-accent">
          <ExternalLink size={14} />
        </span>
      )}
    </>
  );

  const className = "group flex h-24 min-w-0 overflow-hidden rounded-xl border border-[#dce1eb] bg-white text-left shadow-[0_3px_10px_rgba(31,40,74,0.05)] transition hover:border-[#c8c4ef] hover:shadow-[0_5px_14px_rgba(31,40,74,0.08)]";
  return onRemove ? (
    <article className={className}>{content}</article>
  ) : (
    <a className={className} href={url} rel="noreferrer" target="_blank">{content}</a>
  );
}

export function TutorDocumentLink({ document }: { document: TutorReviewDocument }) {
  const fileName = document.file_name.trim() || "Uploaded document";
  const type = displayType(document.file_type, fileName);
  return (
    <DocumentCard
      fileName={fileName}
      fileType={document.file_type}
      meta={`${type} · Previously uploaded`}
      url={document.document_url}
    />
  );
}

export function TutorLocalDocumentLink({ file, onRemove }: { file: File; onRemove: () => void }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <DocumentCard
      fileName={file.name}
      fileType={file.type}
      meta={`${formatFileSize(file.size)} · ${displayType(file.type, file.name)}`}
      onRemove={onRemove}
      url={url}
    />
  );
}
