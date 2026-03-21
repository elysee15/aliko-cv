import ReactMarkdown from "react-markdown";

export function Md({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mt-1 text-sm">{children}</p>,
        ul: ({ children }) => (
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-sm">{children}</ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
