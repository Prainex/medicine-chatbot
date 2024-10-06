'use client'
import React, { useState, useEffect } from 'react';
import { Container, Typography, AppBar, Toolbar, Button, Box, TextField, Paper, IconButton, Drawer, Tooltip, Chip, Stack } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newItem, setNewItem] = useState('');
    const [activeField, setActiveField] = useState(null);
    
    // Initialize with empty arrays explicitly
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
    const theme = useTheme();

    // Load profile from localStorage when component mounts
    useEffect(() => {
        try {
            const savedProfile = localStorage.getItem('userProfile');
            if (savedProfile) {
                const parsedProfile = JSON.parse(savedProfile);
                // Ensure arrays are properly initialized
                const sanitizedProfile = {
                    email: parsedProfile.email || '',
                    gender: parsedProfile.gender || '',
                    dateOfBirth: parsedProfile.dateOfBirth || '',
                    medications: Array.isArray(parsedProfile.medications) ? parsedProfile.medications : [],
                    medicalHistory: Array.isArray(parsedProfile.medicalHistory) ? parsedProfile.medicalHistory : [],
                    allergies: Array.isArray(parsedProfile.allergies) ? parsedProfile.allergies : []
                };
                setProfile(sanitizedProfile);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            setProfile(initialProfile);
        }
    }, []);

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleProfileUpdate = () => {
        setIsEditing(false);
        localStorage.setItem('userProfile', JSON.stringify(profile));
    };

    const handleChange = (field) => (event) => {
        setProfile(prevProfile => ({
            ...prevProfile,
            [field]: event.target.value
        }));
    };

    const handleAddItem = (field) => {
        if (newItem.trim()) {
            setProfile(prevProfile => {
                const currentArray = Array.isArray(prevProfile[field]) ? prevProfile[field] : [];
                return {
                    ...prevProfile,
                    [field]: [...currentArray, newItem.trim()]
                };
            });
            setNewItem('');
            setActiveField(null);
        }
    };

    const handleDeleteItem = (field, itemToDelete) => {
        setProfile(prevProfile => {
            const currentArray = Array.isArray(prevProfile[field]) ? prevProfile[field] : [];
            return {
                ...prevProfile,
                [field]: currentArray.filter(item => item !== itemToDelete)
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

    return (
        <>
            {/* Navigation Bar */}
            <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                    <Button onClick={() => router.push('/')}>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            Telemedicine App
                        </Typography>
                    </Button>
                    <Button color="inherit" onClick={() => router.push('/dashboard')}>
                        Dashboard
                    </Button>
                    <Button color="inherit" onClick={() => router.push('/')}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
                {/* Sidebar */}
                <Drawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            position: 'absolute',
                            top: '64px',
                            height: 'calc(100vh - 64px)',
                            borderRight: '1px solid #e0e0e0',
                            width: '250px',
                        },
                    }}
                >
                    <Box sx={{ width: '100%', p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Navigation</Typography>
                        <Button fullWidth sx={{ mb: 1 }} onClick={() => router.push('/dashboard')}>
                            Dashboard
                        </Button>
                        <Button fullWidth sx={{ mb: 1 }} onClick={() => router.push('/appointments')}>
                            Appointments
                        </Button>
                        <Button fullWidth sx={{ mb: 1 }} onClick={() => router.push('/messages')}>
                            Messages
                        </Button>
                    </Box>
                </Drawer>

                {/* Main Content */}
                <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
                    <Container maxWidth="md">
                        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <Typography variant="h4">Profile Information</Typography>
                                <Tooltip title={isEditing ? "Save Changes" : "Edit Profile"}>
                                    <IconButton 
                                        onClick={isEditing ? handleProfileUpdate : () => setIsEditing(true)}
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    label="Email"
                                    value={profile.email}
                                    onChange={handleChange('email')}
                                    disabled={!isEditing}
                                    fullWidth
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
        </>
    );
}