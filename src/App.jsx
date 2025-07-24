import React from "react";
import Task from "./components/Task";
import { Container, Typography } from "@mui/material";

function App() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Live Speedometer Monitor
      </Typography>
      <Task />
    </Container>
  );
}

export default App;
