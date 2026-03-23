-- 宠物平台数据库初始化脚本

-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user', -- user, admin, vet, breeder
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 宠物档案表
CREATE TABLE pets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(50) NOT NULL,
    species VARCHAR(20) NOT NULL, -- dog, cat, bird, etc.
    breed VARCHAR(50),
    gender VARCHAR(10),
    birth_date DATE,
    weight DECIMAL(5,2),
    color VARCHAR(30),
    microchip_id VARCHAR(50),
    photo_url VARCHAR(255),
    is_neutered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 商品分类表
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    parent_id INTEGER REFERENCES categories(id),
    icon_url VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 商品表
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    images TEXT[], -- 图片 URL 数组
    brand VARCHAR(100),
    specifications JSONB, -- 规格参数
    is_active BOOLEAN DEFAULT TRUE,
    sales_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 订单表
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, shipped, completed, cancelled
    payment_method VARCHAR(20),
    payment_time TIMESTAMP,
    shipping_address JSONB,
    tracking_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 订单明细表
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 宠物医院表
CREATE TABLE hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    business_hours JSONB, -- 营业时间
    services TEXT[], -- 服务项目
    rating DECIMAL(3,2) DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 预约表
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    pet_id INTEGER REFERENCES pets(id),
    hospital_id INTEGER REFERENCES hospitals(id),
    doctor_name VARCHAR(50),
    appointment_time TIMESTAMP NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 领养信息表
CREATE TABLE adoptions (
    id SERIAL PRIMARY KEY,
    publisher_id INTEGER REFERENCES users(id),
    pet_name VARCHAR(50) NOT NULL,
    species VARCHAR(20) NOT NULL,
    breed VARCHAR(50),
    age_months INTEGER,
    gender VARCHAR(10),
    description TEXT,
    photos TEXT[],
    location VARCHAR(100),
    contact_phone VARCHAR(20),
    requirements TEXT, -- 领养要求
    status VARCHAR(20) DEFAULT 'available', -- available, pending, adopted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 健康记录表
CREATE TABLE health_records (
    id SERIAL PRIMARY KEY,
    pet_id INTEGER REFERENCES pets(id),
    record_type VARCHAR(30), -- vaccine, checkup, treatment, deworming
    title VARCHAR(200) NOT NULL,
    description TEXT,
    hospital_id INTEGER REFERENCES hospitals(id),
    record_date DATE NOT NULL,
    next_date DATE, -- 下次提醒日期
    attachments TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 社区帖子表
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    pet_id INTEGER REFERENCES pets(id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    images TEXT[],
    tags TEXT[],
    category VARCHAR(50), -- share, question, adoption_lost, etc.
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 评论表
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id),
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES comments(id),
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_hospital_id ON appointments(hospital_id);
CREATE INDEX idx_adoptions_status ON adoptions(status);
CREATE INDEX idx_health_records_pet_id ON health_records(pet_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_category ON posts(category);

-- 插入初始分类数据
INSERT INTO categories (name, parent_id, sort_order) VALUES
('宠物食品', NULL, 1),
('主粮', 1, 1),
('零食', 1, 2),
('营养品', 1, 3),
('宠物用品', NULL, 2),
('玩具', 5, 1),
('窝垫', 5, 2),
('牵引绳', 5, 3),
('清洁用品', 5, 4),
('宠物医疗', NULL, 3);
