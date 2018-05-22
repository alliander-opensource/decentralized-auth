import React from 'react';
import { Link } from 'react-router-dom';
import Paper from 'material-ui/Paper';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import IconSocialMood from 'material-ui/svg-icons/social/mood';
import IconHardwareDeviceHub from 'material-ui/svg-icons/hardware/cast';

const SideMenu = () => {
  const style = {
    height: '100%',
    margin: 20,
  };
  return (
    <div>
      <Paper style={style} id="navigation-menu">
        <Divider />
        <List>
          <Link to="/my-devices">
            <ListItem primaryText="My Devices" leftIcon={<IconHardwareDeviceHub />} />
          </Link>
          <Link to="/my-policies">
            <ListItem primaryText="My Policies" leftIcon={<IconSocialMood />} />
          </Link>
        </List>
      </Paper>
    </div>
  );
};

export default SideMenu;
