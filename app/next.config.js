module.exports = {
  exportPathMap: function() {
    return {
      '/': { page: '/' },
      '/level/1': { 
        page: '/',
        query: {
          level: 1
        } 
      },
      '/level/2': { 
        page: '/',
        query: {
          level: 2
        }  
      }
    }
  }
}
