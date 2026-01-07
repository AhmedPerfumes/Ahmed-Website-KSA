import Image from 'next/image';
import React from 'react';

const DescriptionSection = ({ image, title, text, imagePosition = 'left' }) => {
    // We can use inline style to reverse the flex-direction for the 'right' position
    const style = imagePosition === 'right' ? { flexDirection: 'row-reverse' } : {};

    return (
        // The main container now uses our custom 'note-block' class
        <div className="note-block" style={style}>
            <div className="note-block__image">
                <Image height={1000} width={1000} className='img' src={`${process.env.NEXT_PUBLIC_API_URL}storage/${image}`} alt={title} />
            </div>
            <div className="note-block__text">
                <h2 className="note-block__title">{title}</h2>
                <p className="note-block__description">{text}</p>
            </div>
        </div>
    );
};

export default DescriptionSection;