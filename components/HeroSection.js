// components/HeroSection.js
import { Box, Typography, Container, Button } from '@mui/material';

export default function HeroSection() {
  return (
    <Box
      sx={{
        //backgroundImage: 'url(/hero-image.jpg)', // Replace with your image path
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        padding: 3
      }}
    >
      <Container>
        <Typography variant="h2" gutterBottom>
          Welcome to Pantry Tracker
        </Typography>
        <Typography variant="h5" gutterBottom>
          Keep track of your pantry items easily and efficiently.
        </Typography>
        <Button variant="contained" color="primary" size="large">
          Get Started
        </Button>
      </Container>
    </Box>
  );
}