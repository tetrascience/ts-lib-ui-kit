import styled from "styled-components";
import { Button } from "@atoms/Button";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

function App() {
  return (
    <AppContainer>
      <ButtonGroup>
        <Button variant="primary">Click me</Button>
        <Button variant="secondary">Cancel</Button>
      </ButtonGroup>
    </AppContainer>
  );
}

export default App;
