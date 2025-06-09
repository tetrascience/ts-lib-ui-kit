import React from "react";
import { StoryFn } from "@storybook/react";
import { MarkdownDisplay } from "./MarkdownDisplay"; // Adjust the path if needed

export default {
  title: "Atoms/MarkdownDisplay",
  component: MarkdownDisplay,
  argTypes: {
    markdown: {
      control: "text",
      description: "The Markdown string to display.",
    },
  },
};

const Template: StoryFn<React.ComponentProps<typeof MarkdownDisplay>> = (
  args
) => <MarkdownDisplay {...args} />;

export const Default = Template.bind({});
Default.args = {
  markdown: `
# Welcome to Markdown Display

This is a component for rendering Markdown with Ant Design styling.

## Features

-   **Styled with Ant Design:** Uses Ant Design's Typography component for consistent styling.
-   **GitHub Flavored Markdown:** Supports GFM features like:
    -   Task lists:
        -   [x] Completed task
        -   [ ] Incomplete task
    -   Tables:

        | Header 1 | Header 2 |
        | -------- | -------- |
        | Cell 1   | Cell 2   |
        | Cell 3   | Cell 4   |
-   **Syntax Highlighting:** Uses \`react-syntax-highlighter\` for code blocks.

    \`\`\`javascript
    const message = "Hello, world!";
    console.log(message);
    \`\`\`

-   **Inline code:** \`inline code\`
-   **Links:** [Example Link](https://www.example.com)
-   **Images:**
    ![Example Image](https://via.placeholder.com/150)
-   **Blockquotes:**
    > This is a blockquote.
-   **Horizontal Rules:**
    ---
-   **Bold and Italics:** **Bold Text** and *Italic Text*
-   **Headings:**
    # Heading 1
    ## Heading 2
    ### Heading 3
    #### Heading 4
    ##### Heading 5
    ###### Heading 6
- **Ordered and Unordered Lists**
    1. Ordered List Item 1
    2. Ordered List Item 2
        * Unordered List Item 1
        * Unordered List Item 2
`,
};

export const WithCustomMarkdown = Template.bind({});
WithCustomMarkdown.args = {
  markdown: `
## Custom Markdown Example

You can pass in any Markdown string you want.

### Sub-heading

Here's a list:

* Item 1
* Item 2
    * Sub-item 1
    * Sub-item 2

And a table:

| Name   | Age |
| ------ | --- |
| Alice  | 30  |
| Bob    | 25  |

\`\`\`python
def hello():
    print("Hello, world!")
\`\`\`
`,
};
