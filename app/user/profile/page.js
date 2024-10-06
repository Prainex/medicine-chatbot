"use client";
import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, AppBar, Toolbar, Button, Box, TextField, Paper, 
    IconButton, Drawer, Tooltip, Chip, Stack, ButtonBase, Snackbar, Alert 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../firebase'; // Adjust your Firebase import path
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

export default function ProfilePage() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newItem, setNewItem] = useState('');
    const [activeField, setActiveField] = useState(null);
    const [loading, setLoading] = useState(true);
    const [emailError, setEmailError] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);  // State to control Snackbar visibility
    const [snackbarMessage, setSnackbarMessage] = useState(''); // Snackbar message
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Snackbar severity

    const initialProfile = {
        email: '',
        gender: '',
        dateOfBirth: '',
        medications: [],
        medicalHistory: [],
        allergies: []
    };

    const [profile, setProfile] = useState(initialProfile);
    const router = useRouter();
    const theme = useTheme(); // Make sure to use the theme

    useEffect(() => {
        const fetchProfile = async () => {
            const user = auth.currentUser;
            if (user) {
                const email = user.email;
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProfile({ ...docSnap.data(), email });
                } else {
                    console.error('No profile data found');
                }
            } else {
                router.push('/login');
            }
            setLoading(false);
        };

        fetchProfile();
    }, [router]);

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleProfileUpdate = async () => {
        setIsEditing(false);
        const user = auth.currentUser;
        if (user) {
            try {
                if (profile.email !== user.email) {
                    const currentPassword = prompt('Please re-enter your password to change the email:');
                    await reauthenticateWithCredential(
                        user,
                        EmailAuthProvider.credential(user.email, currentPassword)
                    );
                    await updateEmail(user, profile.email);
                    setSnackbarMessage('Email updated successfully!');
                }

                const docRef = doc(db, 'users', user.uid);
                await updateDoc(docRef, profile);
                setSnackbarMessage('Profile updated successfully!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true); // Open Snackbar
            } catch (error) {
                console.error('Error updating profile:', error);
                setSnackbarMessage('Error updating profile: ' + error.message);
                setSnackbarSeverity('error');
                setSnackbarOpen(true); // Open Snackbar for error
            }
        }
    };

    const handleChange = (field) => (event) => {
        setProfile((prevProfile) => ({
            ...prevProfile,
            [field]: event.target.value
        }));
    };

    const handleAddItem = (field) => {
        if (newItem.trim()) {
            setProfile((prevProfile) => {
                const currentArray = Array.isArray(prevProfile[field]) ? prevProfile[field] : [];
                return {
                    ...prevProfile,
                    [field]: [...currentArray, newItem.trim()],
                };
            });
            setNewItem('');
            setActiveField(null);
        }
    };

    const handleDeleteItem = (field, itemToDelete) => {
        setProfile((prevProfile) => {
            const currentArray = Array.isArray(prevProfile[field]) ? prevProfile[field] : [];
            return {
                ...prevProfile,
                [field]: currentArray.filter((item) => item !== itemToDelete),
            };
        });
    };

    const getArrayField = (field) => {
        return Array.isArray(profile[field]) ? profile[field] : [];
    };

    const renderListField = (field, label) => {
        const items = getArrayField(field);
        return (
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>{label}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                    {items.map((item, index) => (
                        <Chip
                            key={index}
                            label={item}
                            onDelete={isEditing ? () => handleDeleteItem(field, item) : undefined}
                            sx={{ mb: 1 }}
                        />
                    ))}
                </Stack>
                {isEditing && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            size="small"
                            placeholder={`Add new ${label.toLowerCase()}`}
                            value={activeField === field ? newItem : ''}
                            onChange={(e) => {
                                setActiveField(field);
                                setNewItem(e.target.value);
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddItem(field);
                                }
                            }}
                        />
                        <IconButton onClick={() => handleAddItem(field)} color="primary">
                            <AddIcon />
                        </IconButton>
                    </Box>
                )}
            </Box>
        );
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    if (loading) {
        return <Typography>Loading...</Typography>; // Optionally use a loader
    }

    return (
        <>
            {/* Navigation Bar */}
            <AppBar position="static" elevation={0} sx={{ backgroundColor: theme.palette.primary.main, borderBottom: '1px solid #e0e0e0' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                    <ButtonBase onClick={() => router.push('/')} sx={{ color: theme.palette.common.white }}>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            Telemedicine App
                        </Typography>
                    </ButtonBase>
                    <Button color="inherit" onClick={() => router.push('/user/dashboard')}>
                        Dashboard
                    </Button>
                    <Button color="inherit" onClick={() => router.push('/')}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
                <Drawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{ '& .MuiDrawer-paper': { position: 'absolute', top: '64px', height: 'calc(100vh - 64px)', width: '250px' } }}
                >
                    <Box sx={{ width: '100%', p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Navigation</Typography>
                        <Button fullWidth onClick={() => router.push('/dashboard')}>Dashboard</Button>
                        <Button fullWidth onClick={() => router.push('/appointments')}>Appointments</Button>
                        <Button fullWidth onClick={() => router.push('/messages')}>Messages</Button>
                    </Box>
                </Drawer>

                <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
                    <Container maxWidth="md">
                        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <Typography variant="h4">Profile Information</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {/* Save button only appears when editing */}
                                    {isEditing && (
                                        <Button
                                            color="primary"
                                            variant="contained"
                                            startIcon={<SaveIcon />}
                                            onClick={handleProfileUpdate}
                                        >
                                            Save
                                        </Button>
                                    )}
                                    {!isEditing && (
                                        <Tooltip title="Edit Profile">
                                            <IconButton onClick={() => setIsEditing(true)} color="primary">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    label="Email"
                                    value={profile.email}
                                    onChange={handleChange('email')}
                                    disabled={!isEditing}
                                    fullWidth
                                    error={!!emailError}
                                    helperText={emailError}
                                />

                                <TextField
                                    label="Gender"
                                    value={profile.gender}
                                    onChange={handleChange('gender')}
                                    disabled={!isEditing}
                                    fullWidth
                                />

                                <TextField
                                    label="Date of Birth"
                                    value={profile.dateOfBirth}
                                    onChange={handleChange('dateOfBirth')}
                                    disabled={!isEditing}
                                    fullWidth
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                />
                                
                                {renderListField('medications', 'Medications')}
                                {renderListField('medicalHistory', 'Medical History')}
                                {renderListField('allergies', 'Allergies')}
                            </Box>
                        </Paper>
                    </Container>
                </Box>
            </Box>

            {/* Snackbar for Notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
}
