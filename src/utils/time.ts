export const getTimeDifference = (timestamp: number) => {
    const now = Date.now();
    const then = new Date(timestamp);
    
    let diffInSeconds = Math.floor((now - then.getTime()) / 1000);
  
    const units = [
      { count: 31536000, name: 'year' },
      { count: 2592000, name: 'month' },
      { count: 604800, name: 'week' },
      { count: 86400, name: 'day' },
      { count: 3600, name: 'hour' },
      { count: 60, name: 'minute' },
      { count: 1, name: 'second' }
    ];
  
    for (const unit of units) {
      const count = Math.floor(diffInSeconds / unit.count);
      if (count > 0) {
        if (count === 1) {
          return `${count} ${unit.name} ago`;
        } else {
          return `${count} ${unit.name}s ago`;
        }
      }
      diffInSeconds %= unit.count;
    }
  
    return 'just now';
}