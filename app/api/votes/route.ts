import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    // Check if content exists
    const contentExists = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!contentExists) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Count votes for the content
    const aiVotes = await prisma.vote.count({
      where: {
        contentId,
        vote: true,  // True represents AI vote
      },
    });

    const humanVotes = await prisma.vote.count({
      where: {
        contentId,
        vote: false, // False represents Human vote
      },
    });

    // Return vote statistics
    return NextResponse.json({
      contentId,
      aiVotes,
      humanVotes,
      totalVotes: aiVotes + humanVotes,
    });
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { contentId, userId, vote } = body;
    
    if (!contentId || vote === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Use anonymous vote if userId is not provided
    const voteData = {
      contentId,
      vote,
      userId: userId || 'anonymous',
    };
    
    // Check if content exists
    const contentExists = await prisma.content.findUnique({
      where: { id: contentId },
    });
    
    if (!contentExists) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }
    
    // Check if user has already voted for this content
    if (userId) {
      const existingVote = await prisma.vote.findFirst({
        where: {
          contentId,
          userId,
        },
      });
      
      if (existingVote) {
        return NextResponse.json(
          { error: 'User has already voted for this content' },
          { status: 409 }
        );
      }
    }
    
    // Create new vote
    const newVote = await prisma.vote.create({
      data: voteData,
    });
    
    return NextResponse.json(newVote, { status: 201 });
  } catch (error) {
    console.error('Error creating vote:', error);
    return NextResponse.json(
      { error: 'Failed to create vote' },
      { status: 500 }
    );
  }
}
