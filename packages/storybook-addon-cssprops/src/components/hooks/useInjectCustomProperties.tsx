import * as React from "react";
import { CustomPropertiesKeyValues } from "../CssPropsTable/types";
import {story} from '../../register'
function o2s(style: React.CSSProperties) {
  let string = "";
  Object.keys(style).forEach(function (a) {
    // @ts-ignore
    string += `${a}: ${style[a]};`;
  });
  return string;
}
function convertToKebabCase(input:String) {
  // Split the input string by '/'
  const parts = input.split('/');
  // Take the last part
  const lastPart = parts[parts.length - 1];

  // Convert camelCase or PascalCase to kebab-case
  const kebabCase = lastPart
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // Insert hyphens between lowercase/number and uppercase letters
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2') // Insert hyphens between uppercase letters followed by lowercase letters
    .toLowerCase(); // Convert to lowercase

  return kebabCase;
}

export const useInjectCustomProperties = (
  customProperties: CustomPropertiesKeyValues = {}
) => {
  const styles = Object.keys(customProperties)
    .filter((i) => customProperties[i])
    .reduce(
      (o, key) => ({ ...o, [`--${key}`]: customProperties[key] }),
      {}
    ) as React.CSSProperties;

  const previewRef = React.useRef<Document | undefined>();

  React.useLayoutEffect(() => {
    const iframe = document.querySelector<HTMLIFrameElement>(
      "#storybook-preview-iframe"
    );
    if (iframe) {
      previewRef.current = iframe?.contentWindow?.document;
    } else if (document) {
      previewRef.current = document;
    }
  }, [customProperties]);

  React.useLayoutEffect(() => {
    const stringifiedStyles = o2s(styles);
    if (stringifiedStyles) {
      const el= convertToKebabCase(story?.title)
      previewRef?.current?.body?.setAttribute("style", `${el}{${stringifiedStyles}} ${customProperties}`);
      const tst=document.createElement('style')
      tst.id='css-props-style'
      tst.innerHTML=`${el}{${stringifiedStyles}} ${customProperties}`
      previewRef?.current?.body?.appendChild(tst)
    }
    return () => {
      const styles = previewRef?.current?.getElementById('css-props-style')
      if (styles){
        styles.remove();
      }
      previewRef?.current?.body?.removeAttribute("style");
    };
  }, [customProperties, styles]);
};
