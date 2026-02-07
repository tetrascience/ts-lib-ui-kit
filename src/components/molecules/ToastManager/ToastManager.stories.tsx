import { Meta, StoryObj } from "@storybook/react";
import styled from "styled-components";
import { ToastManager, ToastPosition, toast } from "./ToastManager";

interface ShowcaseProps {
  position: ToastPosition;
}

const meta: Meta<ShowcaseProps> = {
  title: "Molecules/ToastManager",
  component: ToastManager,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<ShowcaseProps>;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
`;

const Button = styled.button<{ variant: string }>`
  padding: 8px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: white;
  background-color: ${(props) => {
    switch (props.variant) {
      case "info":
        return "#4072D2";
      case "success":
        return "#08AD37";
      case "warning":
        return "#F9AD14";
      case "danger":
        return "#F93614";
      default:
        return "#48566A";
    }
  }};

  &:hover {
    opacity: 0.9;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #e1e4e8;
  width: 600px;
`;

const Showcase = ({ position }: ShowcaseProps) => {
  const showInfoToast = () => toast.info("Info Toast", "This is an information message");
  const showSuccessToast = () => toast.success("Success Toast", "Operation completed successfully");
  const showWarningToast = () => toast.warning("Warning Toast", "This action might have consequences");
  const showDangerToast = () => toast.danger("Danger Toast", "An error has occurred");
  const showDefaultToast = () => toast.default("Default Toast", "This is a default message");

  const showHeadingOnlyToast = () => toast.info("This toast has no description");

  return (
    <Container>
      <h2>Toast Showcase</h2>
      <p>Position: {position}</p>

      <h3>Toast Types</h3>
      <ButtonGrid>
        <Button variant="default" onClick={showDefaultToast}>
          Default Toast
        </Button>
        <Button variant="info" onClick={showInfoToast}>
          Info Toast
        </Button>
        <Button variant="success" onClick={showSuccessToast}>
          Success Toast
        </Button>
        <Button variant="warning" onClick={showWarningToast}>
          Warning Toast
        </Button>
        <Button variant="danger" onClick={showDangerToast}>
          Danger Toast
        </Button>
      </ButtonGrid>

      <Button variant="info" onClick={showHeadingOnlyToast}>
        Toast without description
      </Button>

      <ToastManager position={position} />
    </Container>
  );
};

export const TopPosition: Story = {
  name: "[SW-T960] Top Position",
  render: () => <Showcase position="top" />,
};

export const BottomPosition: Story = {
  name: "[SW-T961] Bottom Position",
  render: () => <Showcase position="bottom" />,
};
