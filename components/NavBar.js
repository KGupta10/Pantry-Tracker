// components/NavBar.js
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';

export default function NavBar() {
  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Pantry Tracker
          </Typography>
          <Button color="inherit">Home</Button>
          <Button color="inherit">About</Button>
          <Button color="inherit">Contact</Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}