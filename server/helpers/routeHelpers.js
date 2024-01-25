function isActive(route, currentRoute){
    return route === currentRoute ? 'active' : '';
}

module.exports = { isActive }