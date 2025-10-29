import type { Meta, StoryObj } from "@storybook/react";
import { CodeScriptEditorButton } from "./CodeScriptEditorButton";

const meta: Meta<typeof CodeScriptEditorButton> = {
  title: "Molecules/CodeScriptEditorButton",
  component: CodeScriptEditorButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    language: {
      control: { type: "select" },
      options: ["python", "javascript", "typescript", "sql", "json", "yaml"],
    },
    disabled: {
      control: { type: "boolean" },
    },
    isEditMode: {
      control: { type: "boolean" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CodeScriptEditorButton>;

// Basic examples
export const Default: Story = {
  args: {
    initialCode: `def hello_world():
    print("Hello, World!")
    return "Hello, World!"

hello_world()`,
    language: "python",
  },
};

export const Empty: Story = {
  args: {
    initialCode: "",
    language: "python",
  },
};

export const JavaScript: Story = {
  args: {
    initialCode: `function helloWorld() {
  console.log("Hello, World!");
  return "Hello, World!";
}

helloWorld();`,
    language: "javascript",
  },
};

export const SQL: Story = {
  args: {
    initialCode: `SELECT 
  id,
  name,
  email,
  created_at
FROM users 
WHERE active = true
ORDER BY created_at DESC
LIMIT 10;`,
    language: "sql",
  },
};

export const JSON: Story = {
  args: {
    initialCode: `{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "age": 30,
  "active": true,
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}`,
    language: "json",
  },
};

// State examples
export const Disabled: Story = {
  args: {
    initialCode: `def example():
    return "This editor is disabled"`,
    language: "python",
    disabled: true,
  },
};

// Custom text and titles
export const CustomLabels: Story = {
  args: {
    initialCode: `# Custom configuration script
config = {
    "api_endpoint": "https://api.example.com",
    "timeout": 30,
    "retries": 3
}`,
    language: "python",
    buttonText: "Configure Script",
    modalTitle: "Script Configuration",
  },
};

// With callback
export const WithCallback: Story = {
  args: {
    initialCode: `print("Initial code")`,
    language: "python",
    onCodeSave: (code: string) => {
      console.log("Code saved:", code);
      alert(`Code saved! Length: ${code.length} characters`);
    },
  },
};

// Long code example
export const LongCode: Story = {
  args: {
    initialCode: `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

def load_and_preprocess_data(file_path):
    """
    Load and preprocess the dataset
    """
    # Load the data
    data = pd.read_csv(file_path)
    
    # Handle missing values
    data = data.dropna()
    
    # Feature engineering
    data['feature_1_squared'] = data['feature_1'] ** 2
    data['feature_interaction'] = data['feature_1'] * data['feature_2']
    
    return data

def train_model(X, y):
    """
    Train a Random Forest model
    """
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Initialize and train the model
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42
    )
    model.fit(X_train, y_train)
    
    # Make predictions
    y_pred = model.predict(X_test)
    
    # Evaluate the model
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred)
    
    print(f"Accuracy: {accuracy:.4f}")
    print("Classification Report:")
    print(report)
    
    return model

# Main execution
if __name__ == "__main__":
    # Load and preprocess data
    data = load_and_preprocess_data("dataset.csv")
    
    # Prepare features and target
    X = data.drop('target', axis=1)
    y = data['target']
    
    # Train the model
    model = train_model(X, y)
    
    print("Model training completed!")`,
    language: "python",
  },
};

// Different button variants
export const SmallButton: Story = {
  args: {
    initialCode: `console.log("Small button example");`,
    language: "javascript",
    buttonProps: {
      size: "small",
    },
  },
};

export const PrimaryButton: Story = {
  args: {
    initialCode: `console.log("Primary button example");`,
    language: "javascript",
    buttonProps: {
      variant: "primary",
    },
  },
};

export const SecondaryButton: Story = {
  args: {
    initialCode: `console.log("Secondary button example");`,
    language: "javascript",
    buttonProps: {
      variant: "secondary",
    },
  },
};
