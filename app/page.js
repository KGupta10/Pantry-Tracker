'use client'
import { useState, useEffect, useRef } from "react";
import { ThemeProvider, CssBaseline, Box, Modal, TextField, Typography, Button, Container, Grid, Card, CardContent, CardActions, IconButton, InputBase, Paper } from '@mui/material';
import { Add, Remove, Search as SearchIcon } from '@mui/icons-material';
import { collection, getDocs, query, setDoc, getDoc, doc, deleteDoc, addDoc, where } from "firebase/firestore";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { firestore, storage } from "@/firebase";
import theme from '@/theme';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CardMedia from '@mui/material/CardMedia';
import { Camera } from 'react-camera-pro';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [expiryDate, setExpiryDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [image, setImage] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const [cameraImage, setCameraImage] = useState(null);
  const cameraRef = useRef(null);

  const updateInventory = async () => {
    const snapshot = await getDocs(collection(firestore, 'inventory'));
    const inventoryList = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      inventoryList.push({
        id: doc.id,
        name: data.name,
        quantity: data.quantity,
        expiry: data.expiry ? dayjs(data.expiry.toDate()) : null,
        imageUrl: data.imageUrl,
      });
    });

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const filteredList = inventoryList.filter(item =>
        item.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
      setInventory(filteredList);
    } else {
      setInventory(inventoryList);
    }
  };

  const addItem = async (name, expiry, image) => {
    let imageUrl = null;
    if (image) {
      if (typeof image === 'object' && image.url) {
        imageUrl = image.url; // Use the URL from the camera
      } else {
        const storageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }
    }
  
    const snapshot = query(collection(firestore, 'inventory'), where('name', '==', name));
    const docs = await getDocs(snapshot);
  
    if (docs.empty) {
      await addDoc(collection(firestore, 'inventory'), {
        name,
        quantity: 1,
        expiry: expiry ? expiry.toDate() : null,
        imageUrl,
      });
    } else {
      const docRef = doc(collection(firestore, 'inventory'), docs.docs[0].id);
      const docSnap = await getDoc(docRef);
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 }, { merge: true });
    }
  
    updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 }, { merge: true });
      }
    }

    updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    updateInventory();
  }, [searchTerm]); // Update inventory when searchTerm changes

  const upcomingExpirations = inventory.filter(item => {
    const expiryDate = item.expiry ? item.expiry : null;
    return expiryDate && expiryDate.isBefore(dayjs().add(30, 'day'));
  });

  const lowInventory = inventory.filter(item => item.quantity < 5);
  
  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePhoto();
      setCameraImage(photo);
  
      // Convert the photo to a Blob for upload
      const response = await fetch(photo);
      const blob = await response.blob();
      
      // Create a file with a unique name
      const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: blob.type });
  
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `images/${file.name}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);
  
      // Set the image URL for the item
      setImage({ url: imageUrl, name: file.name });
  
      // Switch back to input fields and display photo
      setUseCamera(false);
    }
  };
  

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box display="flex" flexDirection="column" minHeight="100vh">
          <NavBar />
          <Container maxWidth="lg" sx={{ flex: 1, my: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Paper
                  component="form"
                  sx={{ p: '2px 4px', mb: 2, display: 'flex', alignItems: 'center' }}
                >
                  <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // Update search term
                    inputProps={{ 'aria-label': 'search items' }}
                  />
                  <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={updateInventory}>
                    <SearchIcon />
                  </IconButton>
                </Paper>
                <Button 
                  variant="contained"
                  onClick={handleOpen}
                  sx={{ mb: 2 }}
                >
                  Add New Item
                </Button>
                <Modal
                  open={open}
                  onClose={handleClose}
                >
                  <Box 
                    position="absolute" 
                    top="50%" 
                    left="50%" 
                    width={400} 
                    bgcolor="background.paper" 
                    boxShadow={24} 
                    p={4} 
                    display="flex" 
                    flexDirection="column" 
                    gap={3}
                    sx={{ transform: "translate(-50%, -50%)" }}
                  >
                    <Typography variant="h6">Add Item</Typography>
                    <TextField 
                      variant='outlined'
                      fullWidth
                      label="Item Name"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                    />
                    <DatePicker
                      label="Expiry Date"
                      value={expiryDate}
                      onChange={(newValue) => setExpiryDate(newValue)}
                      renderInput={(params) => <TextField {...params} />}
                    />
                    <Button 
                      variant="contained"
                      onClick={() => setUseCamera(prev => !prev)} // Toggle camera usage
                    >
                      {useCamera ? "Use File Input" : "Use Camera"}
                    </Button>
                    {useCamera ? (
                      <div>
                        <Camera ref={cameraRef} />
                        <Button 
                          variant="contained"
                          onClick={handleTakePhoto}
                        >
                          Take Photo
                        </Button>
                        {cameraImage && (
                          <div>
                            <img src={cameraImage} alt='Taken photo' style={{ width: '100%' }} />
                            <Button
                              variant="contained"
                              onClick={() => setCameraImage(null)} // Reset the photo and allow retaking
                            >
                              Retake Photo
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <TextField 
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                      />
                    )}
                    <Button 
                      variant="contained"
                      onClick={() => {
                        addItem(itemName, expiryDate, image);
                        setItemName('');
                        setExpiryDate(null);
                        setImage(null);
                        setCameraImage(null);
                        handleClose();
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                </Modal>
                <Grid container spacing={2}>
                {inventory.map(({ id, name, quantity, expiry, imageUrl }) => (
                  <Grid item xs={12} sm={6} md={4} key={id}>
                    <Card>
                      <CardMedia
                        component="img"
                        image={imageUrl || "https://www.svgrepo.com/show/508699/landscape-placeholder.svg"}
                        title={name}
                        
                      />
                      <CardContent>
                        <Typography variant="h5">
                          {name.charAt(0).toUpperCase() + name.slice(1)}
                        </Typography>
                        
                        <Typography variant="body2" color="textSecondary">
                          Quantity: {quantity}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Expires: {expiry ? dayjs(expiry.toDate()).format('YYYY-MM-DD') : 'No Expiry Date'}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <IconButton onClick={() => addItem(name)}><Add /></IconButton>
                        <IconButton onClick={() => removeItem({ id, quantity })}><Remove /></IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
                </Grid>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 4 }}>
                  <Typography variant="h6">Upcoming Expirations</Typography>
                  {upcomingExpirations.map(item => (
                    <Box key={item.id} sx={{ my: 1 }}>
                      <Typography variant="body2">{item.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Expires: {item.expiry ? dayjs(item.expiry.toDate()).format('YYYY-MM-DD') : 'No Expiry Date'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                  <Typography variant="h6">Low Inventory</Typography>
                  {lowInventory.map(item => (
                    <Box key={item.id} sx={{ my: 1 }}>
                      <Typography variant="body2">{item.name}</Typography>
                      <Typography variant="body2" color="textSecondary">Quantity: {item.quantity}</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Container>
          <Footer sx={{ mt: 'auto' }} />
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}