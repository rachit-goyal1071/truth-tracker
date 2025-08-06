import Link from 'next/link';
import { Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PT</span>
              </div>
              <span className="font-bold text-xl text-gray-900">
                Political Truth Tracker
              </span>
            </div>
            <p className="text-gray-600 max-w-md">
              A neutral, fact-based platform tracking Indian political promises, 
              incidents, donations, and fact checks. All data is sourced from 
              verified government and credible news sources.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/promises" className="text-gray-600 hover:text-blue-600">
                  Political Promises
                </Link>
              </li>
              <li>
                <Link href="/electoral-bonds" className="text-gray-600 hover:text-blue-600">
                  Electoral Bonds
                </Link>
              </li>
              <li>
                <Link href="/prices" className="text-gray-600 hover:text-blue-600">
                  Price Tracker
                </Link>
              </li>
              <li>
                <Link href="/incidents" className="text-gray-600 hover:text-blue-600">
                  Incident Timeline
                </Link>
              </li>
              <li>
                <Link href="/fact-checks" className="text-gray-600 hover:text-blue-600">
                  Fact Checks
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
            <div className="flex space-x-4">
              <a href="mailto:contact@politicaltruthtracker.com" className="text-gray-600 hover:text-blue-600">
                <Mail className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/politicaltruth" className="text-gray-600 hover:text-blue-600">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://github.com/politicaltruthtracker" className="text-gray-600 hover:text-blue-600">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © 2025 Political Truth Tracker. All rights reserved.
            </p>
            <p className="text-gray-600 text-sm mt-4 md:mt-0">
              <strong>Disclaimer:</strong> This platform compiles publicly available data for educational purposes. 
              All rights remain with respective content owners.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
