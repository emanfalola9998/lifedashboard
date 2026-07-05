import { setDeleteReadingItem, setUpdateReadingStatus } from '@/app/store/dashboardSlice'
import { AppDispatch } from '@/app/store/store'
import { ReadingStatus } from '@/app/types/dashboard'
import { useDashboard } from '@/hooks/useDashboard'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

const ReadlingList = () => {
    const [title, setTitle] = useState<string>("")
    const [author, setAuthor] = useState<string>("")
    const [rating, setRating] = useState<number>(0)
    const [status, setStatus] = useState<ReadingStatus>("Want to Read")
    const [review, setReview] = useState<string | undefined>("") 

    const {dashboardData} = useDashboard()
    const dispatch = useDispatch<AppDispatch>()




    return (
        <div>
        {dashboardData.readingList.map(book => (
            <div key={book.id}>
                {book.author}{book.name}{book.rating}{book.review}{book.status}
                <button onClick={() => dispatch(setDeleteReadingItem(book.id))}></button>
            </div>
        ))}
        <div className="form-container">
            <h2>Add Book</h2>
            <form>
        
            <div>
                <label htmlFor="name">Book Name</label>
                <input type="text" id="name" name="name" placeholder="John Doe" required />
            </div>

            
            <div>
                <label htmlFor="author">Author</label>
                <input type="text" id="author" name="email" placeholder="john@example.com" required />
            </div>


            <div>
                <label htmlFor="status">Topic</label>
                <select id="status" name="status" onChange={(e) => setStatus(e.target.value as ReadingStatus)}>
                    <option value="Want to Read">Want to Read</option>
                    <option value="reading">Reading</option>
                    <option value="Finished">Finished</option>
                </select>
            </div>

            <div >
                <label htmlFor="review">Review</label>
                <textarea id="review" name="review" rows="4" placeholder="Your review here..." ></textarea>
            </div>

            <div class="form-group checkbox-group">
                <input type="checkbox" id="rating" name="rating" value={rating}>
                <input type="checkbox" id="rating" name="rating" value={rating}>
                <input type="checkbox" id="rating" name="rating" value={rating}>
                <input type="checkbox" id="rating" name="rating" value={rating}>
                <input type="checkbox" id="rating" name="rating" value={rating}>

                <label htmlFor="rating">Book Ratings</label>
            </div>

            <button type="submit">Submit</button>
        </form>
        </div>

        </div>
    )
}

export default ReadlingList
