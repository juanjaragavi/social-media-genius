-- Social Media Genius Database Schema
-- PostgreSQL database for storing generated posts, images, and analytics

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Generated Posts Table
CREATE TABLE generated_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('instagram', 'twitter', 'facebook', 'tiktok', 'linkedin')),
    post_type VARCHAR(30) NOT NULL,
    topic TEXT NOT NULL,
    content TEXT NOT NULL,
    hashtags TEXT[], -- Array of hashtags
    metadata JSONB, -- Flexible metadata (engagement estimate, target audience, etc.)
    
    -- Generation parameters
    tone VARCHAR(20),
    content_length VARCHAR(10),
    additional_instructions TEXT,
    
    -- Media references
    image_prompt TEXT,
    image_url TEXT,
    video_prompt TEXT,
    video_url TEXT,
    
    -- Performance metrics
    generation_time_ms INTEGER,
    tokens_used INTEGER,
    estimated_cost_usd DECIMAL(10, 6),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Generated Images Table
CREATE TABLE generated_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES generated_posts(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL,
    prompt TEXT NOT NULL,
    style VARCHAR(30),
    aspect_ratio VARCHAR(10),
    
    -- Image data
    image_url TEXT,
    data_url TEXT, -- Base64 data URL (for temporary storage)
    mime_type VARCHAR(20),
    size_bytes BIGINT,
    size_mb DECIMAL(10, 2),
    dimensions VARCHAR(20),
    
    -- Generation metrics
    generation_time_ms INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Generated Videos Table
CREATE TABLE generated_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES generated_posts(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL,
    prompt TEXT NOT NULL,
    style VARCHAR(30),
    aspect_ratio VARCHAR(10),
    duration_seconds INTEGER,
    
    -- Video data
    video_url TEXT,
    mime_type VARCHAR(20),
    size_bytes BIGINT,
    size_mb DECIMAL(10, 2),
    
    -- Generation metrics
    generation_time_ms INTEGER,
    
    -- Status (since video generation may be async)
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Sessions Table (optional, for future multi-user support)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255),
    session_token TEXT,
    
    -- Session metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Analytics Table (track usage patterns)
CREATE TABLE usage_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL, -- 'post_generated', 'image_generated', 'video_generated'
    platform VARCHAR(20),
    
    -- Performance metrics
    duration_ms INTEGER,
    tokens_used INTEGER,
    cost_usd DECIMAL(10, 6),
    
    -- Success tracking
    success BOOLEAN,
    error_message TEXT,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_posts_platform ON generated_posts(platform);
CREATE INDEX idx_posts_created_at ON generated_posts(created_at DESC);
CREATE INDEX idx_posts_post_type ON generated_posts(post_type);
CREATE INDEX idx_images_post_id ON generated_images(post_id);
CREATE INDEX idx_videos_post_id ON generated_videos(post_id);
CREATE INDEX idx_analytics_event_type ON usage_analytics(event_type);
CREATE INDEX idx_analytics_created_at ON usage_analytics(created_at DESC);

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON generated_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON generated_videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for recent activity
CREATE VIEW recent_activity AS
SELECT 
    p.id,
    p.platform,
    p.post_type,
    p.topic,
    p.created_at,
    CASE 
        WHEN i.id IS NOT NULL THEN true 
        ELSE false 
    END as has_image,
    CASE 
        WHEN v.id IS NOT NULL THEN true 
        ELSE false 
    END as has_video
FROM generated_posts p
LEFT JOIN generated_images i ON p.id = i.post_id
LEFT JOIN generated_videos v ON p.id = v.post_id
ORDER BY p.created_at DESC
LIMIT 100;

-- View for platform statistics
CREATE VIEW platform_statistics AS
SELECT 
    platform,
    COUNT(*) as total_posts,
    AVG(generation_time_ms) as avg_generation_time,
    SUM(tokens_used) as total_tokens,
    SUM(estimated_cost_usd) as total_cost
FROM generated_posts
GROUP BY platform;

COMMENT ON TABLE generated_posts IS 'Stores all generated social media posts with metadata and performance metrics';
COMMENT ON TABLE generated_images IS 'Stores generated images linked to posts';
COMMENT ON TABLE generated_videos IS 'Stores generated videos linked to posts';
COMMENT ON TABLE usage_analytics IS 'Tracks usage patterns and performance analytics';
