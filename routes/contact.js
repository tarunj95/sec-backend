const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// POST /contact
router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    // Detailed Validation
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!message) missingFields.push('message');

    if (missingFields.length > 0) {
        return res.status(400).json({
            error: 'Missing required fields',
            missingFields: missingFields
        });
    }

    try {
        const { data, error } = await supabase
            .from('contact_submissions')
            .insert([
                { name, email, message }
            ])
            .select();

        if (error) {
            console.error('Supabase Error:', error);
            return res.status(500).json({ error: 'Failed to submit contact form.' });
        }

        res.status(200).json({ message: 'Contact form submitted successfully.', data });
    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /contact - Fetch all messages
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('contact_submissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase Error:', error);
            return res.status(500).json({ error: 'Failed to fetch messages.' });
        }

        res.status(200).json({ data });
    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// DELETE /contact/:id - Delete a message by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Message ID is required.' });
    }

    try {
        const { error } = await supabase
            .from('contact_submissions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase Error:', error);
            return res.status(500).json({ error: 'Failed to delete message.' });
        }

        res.status(200).json({ message: 'Message deleted successfully.' });
    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
