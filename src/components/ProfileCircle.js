import React from "react";
import './ProfileCircle.css';

const ProfileCircle = ({ userInitials = "NN" }) => {
    const circleBackgroundColor = '#34a853';

    return (
        <div className="profile-circle" style={{ backgroundColor: circleBackgroundColor }}>
            {userInitials || "NN"}
        </div>
    );
};

export default ProfileCircle;
