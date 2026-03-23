export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-blue-600">🐾 Pet Platform</h1>
            <nav className="space-x-6">
              <a href="#products" className="text-gray-600 hover:text-blue-600">商城</a>
              <a href="#services" className="text-gray-600 hover:text-blue-600">服务</a>
              <a href="#adoption" className="text-gray-600 hover:text-blue-600">领养</a>
              <a href="#community" className="text-gray-600 hover:text-blue-600">社区</a>
              <a href="#health" className="text-gray-600 hover:text-blue-600">健康</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            让每一只宠物都被温柔以待
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            一站式宠物服务平台，从食品用品到医疗健康，从领养交易到社区交流
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
              开始购物
            </button>
            <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition">
              了解更多
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">我们的服务</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">🛍️</div>
              <h4 className="text-xl font-semibold mb-2">宠物商城</h4>
              <p className="text-gray-600">优质食品、用品，智能推荐适合您宠物的产品</p>
            </div>
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">🏥</div>
              <h4 className="text-xl font-semibold mb-2">医疗服务</h4>
              <p className="text-gray-600">在线预约、健康咨询、疫苗提醒</p>
            </div>
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">🏠</div>
              <h4 className="text-xl font-semibold mb-2">领养中心</h4>
              <p className="text-gray-600">为流浪宠物寻找温暖的家</p>
            </div>
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">💬</div>
              <h4 className="text-xl font-semibold mb-2">宠物社区</h4>
              <p className="text-gray-600">分享宠物日常，交流养宠经验</p>
            </div>
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">📊</div>
              <h4 className="text-xl font-semibold mb-2">健康管理</h4>
              <p className="text-gray-600">电子档案、健康记录、在线问诊</p>
            </div>
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">🎓</div>
              <h4 className="text-xl font-semibold mb-2">行为训练</h4>
              <p className="text-gray-600">专业训导师，在线课程</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Pet Platform. All rights reserved.</p>
          <p className="text-gray-400 mt-2">让每一只宠物都被温柔以待 🐾</p>
        </div>
      </footer>
    </main>
  )
}
