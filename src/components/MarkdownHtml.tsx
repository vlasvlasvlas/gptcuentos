import MarkdownIt from 'markdown-it';
import React, { memo, useEffect, useRef, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import tw, { styled } from 'twin.macro';

import { highlight } from '../utils';
import Playground from './Playground';

const Container = styled.div`
  ${tw`bg-transparent!`}

  > pre {
    ${tw`rounded shadow-md border border-gray-200 bg-white!`}
  }
`;

const parseArgs = (raw: string): Record<string, string> => {
  const re = /(?<key>\w+)="(?<value>[^"]*)"/g;
  const args: Record<string, string> = {};

  for (const matched of raw.matchAll(re)) {
    const { key, value } = matched.groups!;
    args[key] = value;
  }

  const [lang] = raw.split(' ', 1);
  if (lang) args.lang = lang;

  return args;
};

const toHtml = (markdown: string, playground?: boolean) => {
  if (!markdown) return '';

  const md = new MarkdownIt({ highlight });
  const defaultFence = md.renderer.rules.fence;

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const { content, info } = tokens[idx];
    const args = parseArgs(info);

    if (playground && args.playground) {
      const el = document.createElement('div');

      Object.assign(el.dataset, {
        playground: 'true',
        type: args.playground,
        title: args.playground,
        lang: args.lang,
        code: content,
      });

      return el.outerHTML;
    }

    return defaultFence?.(tokens, idx, options, env, self) || '';
  };

  return md.render(markdown);
};

export type MarkdownHtmlProps = {
  markdown: string;
  playground?: boolean;
};

export default memo(function MarkdownHtml(props: MarkdownHtmlProps) {
  const { markdown, playground } = props;

  const container = useRef<HTMLDivElement>(null);
  const playgrounds = useRef<Root[]>([]);
  const [html, setHtml] = useState('');

  useEffect(() => {
    setHtml(toHtml(markdown, playground));
  }, []);

  useEffect(() => {
    if (!container.current) return;

    container.current
      .querySelectorAll<HTMLDivElement>('[data-playground]')
      .forEach((el) => {
        const root = createRoot(el);
        root.render(<Playground {...el.dataset} />);
        playgrounds.current.push(root);
      });
  }, [html]);

  useEffect(() => {
    return () => {
      playgrounds.current.forEach((root) => {
        root.unmount();
      });
    };
  }, []);

  return (
    <Container
      ref={container}
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
