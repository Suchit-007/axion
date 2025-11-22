import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { name, email, password, phone, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    try {
      await connectDB();
    } catch (dbError: any) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { 
          message: 'Database connection failed',
          error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        },
        { status: 500 }
      );
    }

    // Check if user already exists
    try {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json(
          { message: 'User already exists with this email' },
          { status: 400 }
        );
      }
    } catch (queryError: any) {
      console.error('User query error:', queryError);
      return NextResponse.json(
        { 
          message: 'Error checking existing user',
          error: process.env.NODE_ENV === 'development' ? queryError.message : undefined
        },
        { status: 500 }
      );
    }

    // Hash password
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (hashError: any) {
      console.error('Password hashing error:', hashError);
      return NextResponse.json(
        { message: 'Error hashing password' },
        { status: 500 }
      );
    }

    // Create user
    try {
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || undefined,
        role: role || 'student'
      });

      return NextResponse.json(
        { 
          message: 'User created successfully',
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
          }
        },
        { status: 201 }
      );
    } catch (createError: any) {
      console.error('User creation error:', createError);
      
      // Handle duplicate key error
      if (createError.code === 11000 || createError.name === 'MongoServerError') {
        return NextResponse.json(
          { message: 'User already exists with this email' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { 
          message: 'Error creating user',
          error: process.env.NODE_ENV === 'development' ? createError.message : undefined
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

